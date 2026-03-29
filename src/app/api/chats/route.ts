import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currentUserId = url.searchParams.get("currentUserId");
  if (!currentUserId) return NextResponse.json([], { status: 400 });

  // 1. Берем участников чатов, в которых состоит текущий юзер
  const members = await prisma.chatmember.findMany({
    where: {
      chat: { chatmember: { some: { user_id: currentUserId } } },
      user_id: { not: currentUserId },
    },
    // Добавляем выборку новых полей из таблицы chatmember
    select: { 
      user_id: true, 
      chat_id: true,
      last_message_text: true, // Из базы
      last_message_at: true    // Из базы
    },
    // Сортируем чаты, чтобы самые свежие были сверху
    orderBy: {
      last_message_at: 'desc'
    }
  });

  const userIds = [...new Set(members.map(m => m.user_id).filter((id): id is string => !!id))];

  const users = await prisma.public_users.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });

  const userMap = new Map(users.map(u => [u.id, u.username]));

  // 2. Формируем результат с текстом и временем последнего сообщения
  const result = members.map(m => ({
    user_id: m.user_id,
    chat_id: m.chat_id,
    username: userMap.get(m.user_id) || "Unknown",
    last_message_text: m.last_message_text, // Прокидываем на фронт
    last_message_at: m.last_message_at,     // Прокидываем на фронт
  }));

  return NextResponse.json(result);
}