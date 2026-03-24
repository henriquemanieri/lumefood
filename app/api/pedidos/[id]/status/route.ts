import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VALID_STATUS_TRANSITIONS } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  note: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id },
    include: { restaurant: { select: { ownerId: true } } },
  })

  if (!order) return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.restaurant.ownerId !== session.user.id) {
    return Response.json({ error: 'Você não gerencia este restaurante' }, { status: 403 })
  }

  const validNextStatuses = VALID_STATUS_TRANSITIONS[order.status] ?? []
  if (!validNextStatuses.includes(data.data.status)) {
    return Response.json(
      { error: `Transição inválida: ${order.status} → ${data.data.status}` },
      { status: 400 }
    )
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: data.data.status,
      statusHistory: { create: { status: data.data.status, note: data.data.note } },
    },
    include: { items: true, statusHistory: { orderBy: { changedAt: 'asc' } } },
  })

  return Response.json(updated)
}
