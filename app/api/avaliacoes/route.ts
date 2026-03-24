import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
  comment: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const { orderId, rating, comment } = data.data

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.userId !== session.user.id) return Response.json({ error: 'Acesso negado' }, { status: 403 })
  if (order.status !== 'DELIVERED') {
    return Response.json({ error: 'Avaliação só é permitida após a entrega do pedido' }, { status: 400 })
  }

  const existing = await prisma.review.findUnique({ where: { orderId } })
  if (existing) return Response.json({ error: 'Este pedido já foi avaliado' }, { status: 409 })

  const review = await prisma.review.create({
    data: { userId: session.user.id, restaurantId: order.restaurantId, orderId, rating, comment: comment ?? null },
  })

  // Atualizar rating médio do restaurante
  const reviews = await prisma.review.findMany({ where: { restaurantId: order.restaurantId }, select: { rating: true } })
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  await prisma.restaurant.update({
    where: { id: order.restaurantId },
    data: { rating: parseFloat(avgRating.toFixed(1)), reviewCount: reviews.length },
  })

  return Response.json(review, { status: 201 })
}
