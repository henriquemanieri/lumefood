import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  code: z.string(),
  subtotal: z.number().positive(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const data = schema.safeParse(body)
  if (!data.success) return Response.json({ error: data.error.issues[0].message }, { status: 400 })

  const { code, subtotal } = data.data

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.isActive) {
    return Response.json({ error: 'Cupom inválido ou expirado' }, { status: 404 })
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return Response.json({ error: 'Cupom expirado' }, { status: 400 })
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return Response.json({ error: 'Cupom esgotado' }, { status: 400 })
  }

  const discountAmount = subtotal * coupon.discount

  return Response.json({
    valid: true,
    code: coupon.code,
    discount: coupon.discount,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
  })
}
