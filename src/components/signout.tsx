'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LogoutAction() {
  // 1. В Next.js 15 обязательно await перед cookies()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Это нормально для Server Actions при редиректе
          }
        },
      },
    }
  )

  // 2. Выходим из Supabase
  await supabase.auth.signOut()

  // 3. Редирект на логин
  redirect('/login')
}