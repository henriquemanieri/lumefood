import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              category: { include: { restaurant: { select: { id: true, name: true, deliveryFee: true, minimumOrder: true } } } }
            }
          }
        }
      }
    }
  })

  return Response.json(cart)
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) return Response.json({ error: 'Carrinho não encontrado' }, { status: 404 })

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: null } })

  return Response.json({ message: 'Carrinho limpo' })
}
