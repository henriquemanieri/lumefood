import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { itemId } = await params
  const body = await request.json()
  const schema = z.object({ quantity: z.number().int().min(1).max(10) })
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) return Response.json({ error: 'Carrinho não encontrado' }, { status: 404 })

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } })
  if (!item) return Response.json({ error: 'Item não encontrado' }, { status: 404 })

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: data.data.quantity },
    include: { menuItem: true },
  })

  return Response.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { itemId } = await params

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: true }
  })
  if (!cart) return Response.json({ error: 'Carrinho não encontrado' }, { status: 404 })

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } })
  if (!item) return Response.json({ error: 'Item não encontrado' }, { status: 404 })

  await prisma.cartItem.delete({ where: { id: itemId } })

  // Se o carrinho ficou vazio, limpar restaurantId
  const remaining = cart.items.length - 1
  if (remaining === 0) {
    await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } })
  }

  return Response.json({ message: 'Item removido' })
}
