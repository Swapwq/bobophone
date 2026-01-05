'use client';
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import SearchUser from "@/components/searchUser";
import AllChatsIncludesCurrentUser from "@/components/allChatsIncludesCurrentUser";
import ChatSidebar from "@/components/chatSidebar";

export default function Page() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) setCurrentUserId(user.id);
    }
    loadUser();
  }, []);

  if (!currentUserId) return <p>Loading user...</p>;

  return (
    <>
      <ChatSidebar currentUserId={currentUserId} />
    </>

    
  );
}
