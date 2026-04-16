import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. Получаем сессию
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()

  // 2. Логика защиты:
  // Если сессии НЕТ и пользователь пытается зайти на главную (или любую внутреннюю страницу)
  if (!session && url.pathname === '/') {
    url.pathname = '/signup'
    return NextResponse.redirect(url)
  }

  // 3. (Опционально) Если сессия ЕСТЬ, но пользователь лезет на /signup или /login
  // Можно его перекидывать обратно в чат:
  if (session && (url.pathname === '/signup' || url.pathname === '/signin')) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  // Матчер оставляем такой же, он исключает статику и картинки
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}