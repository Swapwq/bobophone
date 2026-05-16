'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";
import Loader from "@/components/Loader";
import Messanger from "../components/main";

export default function Page() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        setCurrentUserId(user.id);
        await loadUsername(user.id);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    }
    loadUser();
  }, [router, supabase.auth]);

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

  const [loadingTheme, setLoadingTheme] = useState<'blue' | 'dark' | 'green' | 'purple'>('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('bobophone-theme') as any;
    if (savedTheme) setLoadingTheme(savedTheme);
  }, []);

  // Показываем загрузку, пока проверяем сессию
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-screen transition-colors duration-500 ${loadingTheme === 'dark' ? 'bg-[#0e1621] dark' : 'bg-white'}`}>
        <Loader />
      </div>
    );
  }

  return (
    <>
      
      <Messanger currentUserId={currentUserId} />
    </>
  );
}