import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const aberto = searchParams.get('aberto')

  const restaurants = await prisma.restaurant.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ]
        } : {},
        categoria ? { category: categoria } : {},
        aberto === 'true' ? { isOpen: true } : aberto === 'false' ? { isOpen: false } : {},
      ]
    },
    orderBy: [{ isOpen: 'desc' }, { rating: 'desc' }],
  })

  return Response.json(restaurants)
}
