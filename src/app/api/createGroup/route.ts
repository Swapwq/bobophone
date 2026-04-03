import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
    try {
        const { groupName, userIds, currentUserId } = await req.json();

        const newGroup = await prisma.chat.create({
            data: {
                name: groupName,
                chatmember: {
                    create: [
                        ...userIds.map((id: string) => ({ user_id: id })),
                        { user_id: currentUserId }
                    ]
                }
            }
        });

        const members = await prisma.chatmember.findMany({
            where: {
                chat: {
                chatmember: {
                    some: { user_id: currentUserId }
                }
                },
                // Оставляем это условие, чтобы находить собеседника в приватных чатах
                user_id: { not: currentUserId }
            },
            select: {
                chat_id: true,
                user_id: true,
                last_message_text: true,
                last_message_at: true,
                last_read_at: true,
                // ВНИМАНИЕ: Достаем type и name из связанной таблицы Chat
                chat: {
                select: {
                    type: true,
                    name: true
                }
                },
                // Достаем инфу о юзере (для имени в приватных чатах)
                public_users: { // В логе ошибки у тебя написано users?, проверь имя связи в схеме!
                select: {
                    name: true,
                    username: true
                }
                }
            },
            orderBy: {
                last_message_at: "desc"
            }
            });

            // Мапим данные, чтобы фронт не сошел с ума
            const formattedChats = members.map((m: any) => {
            const isGroup = m.chat?.type === 'group';
            
            return {
                chat_id: m.chat_id,
                user_id: m.user_id,
                last_message_text: m.last_message_text,
                last_message_at: m.last_message_at,
                last_read_at: m.last_read_at,
                type: m.chat?.type || 'private',
                // Если группа — берем название чата, если личка — имя собеседника
                name: isGroup ? (m.chat?.name || "Группа") : (m.users?.name || "Пользователь"),
                username: m.users?.username || ""
            };
            });

            return NextResponse.json(formattedChats);

    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}