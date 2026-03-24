import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/api/auth', '/api/restaurantes']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/register')) {
    return NextResponse.next()
  }

  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { role } = session.user

  if (pathname.startsWith('/admin') && role !== 'RESTAURANT_ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (pathname.startsWith('/api/admin') && role !== 'RESTAURANT_ADMIN') {
    return Response.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
