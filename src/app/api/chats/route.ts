import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currentUserId = url.searchParams.get("currentUserId");
  if (!currentUserId) return NextResponse.json([], { status: 400 });

  try {
    const members = await prisma.chatmember.findMany({
      where: {
        chat: { chatmember: { some: { user_id: currentUserId } } },
        user_id: { not: currentUserId }
      },
      select: {
        chat_id: true,
        user_id: true,
        last_message_text: true,
        last_message_at: true,
        chat: {
          select: {
            type: true,
            name: true
          }
        },
        users: { // Это системная таблица auth.users
          select: {
            public_users: { // Это ТВОЯ таблица с именами
              select: {
                name: true,
                username: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { last_message_at: "desc" }
    });

    const uniqueChats: Record<string, any> = {};

    members.forEach((m: any) => {
      // КЛЮЧЕВОЙ МОМЕНТ: Если этот ID чата уже есть в объекте - ИГНОРИРУЕМ
      if (uniqueChats[m.chat_id]) return;

      const isGroup = m.chat?.type === 'group';
      const profile = m.users?.public_users;

      uniqueChats[m.chat_id] = {
        chat_id: m.chat_id,
        user_id: m.user_id,
        last_message_text: m.last_message_text,
        last_message_at: m.last_message_at,
        type: m.chat?.type || 'private',
        // Название чата
        name: isGroup 
          ? (m.chat?.name || "Групповой чат") 
          : (profile?.name || profile?.username || "Пользователь"),
        username: profile?.username || "",
        phone: profile?.phone || "Скрыт"
      };
    });

    // 2. Превращаем в массив
    const formattedChats = Object.values(uniqueChats);

    // 3. Сортируем (свежие сверху)
    formattedChats.sort((a: any, b: any) => {
      const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return dateB - dateA;
    });

    console.log("ТЕПЕРЬ ОТПРАВЛЯЮ ЧАТОВ:", formattedChats.length); 

    return NextResponse.json(formattedChats);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}