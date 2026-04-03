import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
    try {
        const { groupName, userIds, currentUserId } = await req.json();

        // 1. Создаем чат с типом 'group'
        const newGroup = await prisma.chat.create({
            data: {
                name: groupName,
                type: 'group', // ВАЖНО: указываем, что это группа
                chatmember: {
                    create: [
                        ...userIds.map((id: string) => ({ user_id: id })),
                        { user_id: currentUserId }
                    ]
                }
            }
        });

        // 2. Получаем обновленный список чатов (как в основном API)
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
                    // Заходим в системную таблицу users
                    users: { 
                        select: {
                            // А из неё вытягиваем твою кастомную инфу
                            public_users: {
                                select: {
                                    name: true,
                                    username: true
                                }
                            }
                        }
                    }
                },
                orderBy: { last_message_at: "desc" }
            });

            // Мапим данные с учетом новой вложенности
            const formattedChats = members.map((m: any) => {
                const isGroup = m.chat?.type === 'group';
                
                // Данные теперь лежат в m.users.public_users
                const profile = m.users?.public_users; 

                return {
                    chat_id: m.chat_id,
                    user_id: m.user_id,
                    last_message_text: m.last_message_text,
                    last_message_at: m.last_message_at,
                    type: m.chat?.type || 'private',
                    name: isGroup 
                        ? (m.chat?.name || "Группа") 
                        : (profile?.name || profile?.username || "Пользователь"),
                    username: profile?.username || ""
                };
            });
        return NextResponse.json(formattedChats);

    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}