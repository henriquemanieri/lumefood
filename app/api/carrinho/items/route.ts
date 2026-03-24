import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(1).max(10),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const { menuItemId, quantity } = data.data

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { category: { select: { restaurantId: true } } },
  })
  if (!menuItem) return Response.json({ error: 'Item não encontrado' }, { status: 404 })

  const restaurantId = menuItem.category.restaurantId

  let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id, restaurantId } })
  }

  if (cart.restaurantId && cart.restaurantId !== restaurantId) {
    return Response.json(
      { error: 'Seu carrinho já tem itens de outro restaurante. Limpe o carrinho para continuar.', code: 'DIFFERENT_RESTAURANT' },
      { status: 409 }
    )
  }

  // Verificar quantidade total
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_menuItemId: { cartId: cart.id, menuItemId } }
  })
  const currentQty = existing?.quantity ?? 0
  if (currentQty + quantity > 10) {
    return Response.json({ error: 'Quantidade máxima por item é 10' }, { status: 400 })
  }

  if (!cart.restaurantId) {
    await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId } })
  }

  const cartItem = await prisma.cartItem.upsert({
    where: { cartId_menuItemId: { cartId: cart.id, menuItemId } },
    create: { cartId: cart.id, menuItemId, quantity },
    update: { quantity: { increment: quantity } },
    include: { menuItem: true },
  })

  return Response.json(cartItem, { status: 201 })
}
