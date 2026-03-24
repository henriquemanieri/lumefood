import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!restaurant) {
    return Response.json({ error: 'Restaurante não encontrado' }, { status: 404 })
  }

  return Response.json(restaurant)
}
