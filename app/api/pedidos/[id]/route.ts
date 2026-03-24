import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: { select: { id: true, name: true, imageUrl: true, phone: true } },
      items: true,
      review: true,
      statusHistory: { orderBy: { changedAt: 'asc' } },
    },
  })

  if (!order) return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.userId !== session.user.id && session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return Response.json(order)
}
