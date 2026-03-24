import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  })

  if (!restaurant) return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })
  return Response.json(restaurant)
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isOpen: z.boolean().optional(),
  minimumOrder: z.number().positive().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  deliveryTime: z.number().int().positive().optional(),
  phone: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await request.json()
  const data = updateSchema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const restaurant = await prisma.restaurant.update({
    where: { ownerId: session.user.id },
    data: data.data,
  })

  return Response.json(restaurant)
}
