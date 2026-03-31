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
      last_read_at: true 
    },
    orderBy: {
      last_message_at: 'desc'
    }
  });

  // 2. Собираем уникальные ID собеседников
  const userIds = [...new Set(members.map(m => m.user_id).filter((id): id is string => !!id))];

  // 3. Загружаем данные профилей этих пользователей
  const users = await prisma.public_users.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, name: true, phone: true },
  });

  // Создаем мапу для быстрого поиска: ID -> Объект пользователя
  const userMap = new Map(users.map(u => [u.id, u]));

  // 4. Формируем финальный результат
  const result = members.map(m => {
    // Берем данные из мапы один раз
    const userData = m.user_id ? userMap.get(m.user_id) : null;

    return {
      user_id: m.user_id,
      chat_id: m.chat_id,
      // Используем userData для всех полей профиля
      username: userData?.username || "Unknown",
      name: userData?.name || "Not specified",
      phone: userData?.phone || "Not specified",
      last_message_text: m.last_message_text,
      last_message_at: m.last_message_at,
      peerLastReadAt: m.last_read_at, 
    };
  });

  return NextResponse.json(result);
}