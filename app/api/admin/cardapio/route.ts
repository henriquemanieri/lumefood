import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: session.user.id } })
  if (!restaurant) return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  return Response.json(categories)
}

const createSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  isAvailable: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: session.user.id } })
  if (!restaurant) return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })

  const body = await request.json()
  const data = createSchema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  let categoryId = data.data.categoryId
  if (!categoryId && data.data.categoryName) {
    const cat = await prisma.menuCategory.create({
      data: { restaurantId: restaurant.id, name: data.data.categoryName }
    })
    categoryId = cat.id
  }
  if (!categoryId) return Response.json({ error: 'Informe categoryId ou categoryName' }, { status: 400 })

  const item = await prisma.menuItem.create({
    data: {
      categoryId,
      name: data.data.name,
      description: data.data.description ?? null,
      price: data.data.price,
      isAvailable: data.data.isAvailable ?? true,
    },
  })

  return Response.json(item, { status: 201 })
}
