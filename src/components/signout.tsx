'use server'

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export default async function LogoutAction() {
    const supabase = createServerActionClient({ cookies });
    await supabase.auth.signOut();
    redirect('/login');
}