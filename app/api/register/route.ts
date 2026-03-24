import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.safeParse(body)
    if (!data.success) {
      return Response.json({ error: data.error.issues[0].message }, { status: 400 })
    }

    const { name, email, password, phone } = data.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name, email, password: hashedPassword,
        phone: phone ?? null,
        role: 'CUSTOMER',
        cart: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return Response.json(user, { status: 201 })
  } catch {
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
