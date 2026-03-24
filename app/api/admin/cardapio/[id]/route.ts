import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
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
  const data = updateSchema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const item = await prisma.menuItem.update({ where: { id }, data: data.data })
  return Response.json(item)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  await prisma.menuItem.delete({ where: { id } })
  return Response.json({ message: 'Item removido' })
}
