import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  addressStreet: z.string().min(1),
  addressNumber: z.string().min(1),
  addressDistrict: z.string().min(1),
  addressCity: z.string().min(1),
  addressZip: z.string().optional(),
  addressComplement: z.string().optional(),
  paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      restaurant: { select: { id: true, name: true, imageUrl: true, category: true } },
      items: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(orders)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { menuItem: true } } },
  })

  if (!cart || cart.items.length === 0) {
    return Response.json({ error: 'Carrinho está vazio' }, { status: 400 })
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: cart.restaurantId! } })
  if (!restaurant) return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })
  if (!restaurant.isOpen) return Response.json({ error: 'Este restaurante está fechado no momento' }, { status: 400 })

  const subtotal = cart.items.reduce((s, i) => s + i.menuItem.price * i.quantity, 0)
  if (subtotal < restaurant.minimumOrder) {
    return Response.json({ error: `Pedido mínimo é R$ ${restaurant.minimumOrder.toFixed(2).replace('.', ',')}` }, { status: 400 })
  }

  let discount = 0
  const { couponCode } = data.data
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
    if (coupon && coupon.isActive) {
      discount = subtotal * coupon.discount
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } })
    }
  }

  const total = subtotal + restaurant.deliveryFee - discount

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      restaurantId: restaurant.id,
      status: 'PENDING',
      subtotal,
      deliveryFee: restaurant.deliveryFee,
      discount,
      total,
      couponCode: couponCode?.toUpperCase() ?? null,
      ...data.data,
      items: {
        create: cart.items.map((ci) => ({
          menuItemId: ci.menuItemId,
          name: ci.menuItem.name,
          price: ci.menuItem.price,
          quantity: ci.quantity,
        })),
      },
      statusHistory: { create: { status: 'PENDING' } },
    },
    include: { items: true, restaurant: { select: { name: true } } },
  })

  // Limpar carrinho
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } })

  return Response.json(order, { status: 201 })
}
