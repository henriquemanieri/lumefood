import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')

  const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: session.user.id } })
  if (!restaurant) return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(status ? { status } : {}),
    },
    include: {
      user: { select: { name: true, phone: true } },
      items: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(orders)
}
