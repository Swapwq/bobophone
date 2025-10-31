'use client';

import LogoutAction from "@/components/signout";
import { createClient } from "../../lib/supabase";
import NewMessage from "@/components/newmember";

export default function Page() {
  const supabase = createClient();

  async function NewMessagee() {
    const { data: { user }} = await supabase.auth.getUser();
    NewMessage(user?.id)
  }
  return (
    <>
      <form action={LogoutAction}>
        <button type="submit">
            Leave
        </button>
      </form>
      <form action={NewMessagee}>
        <button type="submit">
          New Message
        </button>
      </form>
    </>
  )
}