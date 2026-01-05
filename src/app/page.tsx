'use client';
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import ChatSidebar from "@/components/chatSidebar";
import SettingMenu from "@/components/settingsMenu";

export default function Page() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
        // После установки userId сразу грузим username
        loadUsername(user.id);
      }
    }
    loadUser();
  }, []);

  async function loadUsername(userId: string) {
    try {
      console.log("Загружаем username для:", userId);
      
      const res = await fetch(`/api/usernames?userId=${userId}`);
      
      if (!res.ok) {
        console.error("Ошибка API:", res.status);
        return;
      }
      
      const data = await res.json();
      console.log("Ответ API:", data);
      
      if (data && data.username) {
        setCurrentUsername(data.username);
      } else {
        console.log("Username не найден");
      }
    } catch (err) {
      console.error("Ошибка загрузки username:", err);
    }
  }

  // Показываем загрузку, если нет userId
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Загрузка пользователя...</p>
      </div>
    );
  }

  return (
    <>
      <SettingMenu currentUserUsername={currentUsername ?? 'Loading...'} />
      <ChatSidebar currentUserId={currentUserId} />
    </>
  );
}