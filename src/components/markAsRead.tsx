'use server';

import { prisma } from "../../lib/prisma";

export async function markMessagesAsRead(userId: string, chatId: string) {
    try {
        await prisma.chatmember.updateMany({
            where: {
                    chat_id: chatId,
                    user_id: userId,
            },
            data: { last_read_at: new Date() }
        })
    } catch (error) {
        console.error("Error marking messages as read:", error);
    }
}