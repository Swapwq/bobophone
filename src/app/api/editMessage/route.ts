import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PUT(req: Request) {
    try {
        const { message_id, content, currentUserId, chat_id } = await req.json();

        const existingMessage = await prisma.message.findUnique({
            where: { id: message_id },
        });

        if (!existingMessage || existingMessage.sender_id !== currentUserId) {
            return NextResponse.json({ error: "Authorization" }, { status: 403 });
        }

        const updatedMessage = await prisma.message.update({
            where: { id: message_id },
            data: { 
                content: content,
                 is_edited: true
                },
                select: {
                    id: true,
                    content: true,
                    is_edited: true,
                }
        });

        await prisma.message.update({
            where: { id: message_id },
            data: { content: content, is_edited: true }
        });

            // ОБЯЗАТЕЛЬНО: Обновляем превью у ВСЕХ участников этого чата
        await prisma.chatmember.updateMany({
            where: { chat_id: chat_id },
            data: { last_message_text: content }
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error("Edit error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}