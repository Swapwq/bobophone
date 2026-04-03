import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currentUserId = url.searchParams.get("currentUserId");
  if (!currentUserId) return NextResponse.json([], { status: 400 });

  // 1. Получаем участников чатов
  const members = await prisma.chatmember.findMany({
    where: {
      chat: { chatmember: { some: { user_id: currentUserId } } },
      user_id: { not: currentUserId },
    },
    select: { 
      user_id: true, 
      chat_id: true,
      last_message_text: true, 
      last_message_at: true,
      last_read_at: true,
      chat: {
          select: {
            type: true,
            name: true
          }
        }
    },
    orderBy: { last_message_at: 'desc' }
  });

  // 2. Собираем уникальные ID собеседников
  const userIds = [...new Set(members.map(m => m.user_id).filter((id): id is string => !!id))];

  // 3. Загружаем данные профилей (Тут всё верно было)
  const usersData = await prisma.public_users.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, name: true, phone: true },
  });

  // --- ВОТ ТУТ БЫЛА ПОТЕРЯ ДАННЫХ ---
  // Создаем мапу, чтобы сопоставить ID и данные юзера
  const profilesMap = new Map(usersData.map(u => [u.id, u]));

  const chatMap = new Map();

  members.forEach((m: any) => {
    if (chatMap.has(m.chat_id)) return;

    const isGroup = m.chat?.type === 'group';
    
    // Ищем профиль в нашей загруженной мапе по ID
    const profile: any = profilesMap.get(m.user_id);

    chatMap.set(m.chat_id, {
      chat_id: m.chat_id,
      user_id: m.user_id,
      last_message_text: m.last_message_text,
      last_message_at: m.last_message_at,
      last_read_at: m.last_read_at,
      type: m.chat?.type || 'private',
      
      // ИСПОЛЬЗУЕМ profile ВМЕСТО m.public_users
      name: isGroup 
        ? (m.chat?.name || "Группа") 
        : (profile?.name || profile?.username || "Пользователь"),
      username: profile?.username || "",
      phone: profile?.phone || "Скрыт",
      full_name: profile?.name || profile?.username || "Не указано",
    });
  });

  return NextResponse.json(Array.from(chatMap.values()));
}