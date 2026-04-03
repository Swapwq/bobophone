import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { message_id, currentUserId, chat_id } = body;

        if (!message_id || !currentUserId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const message = await prisma.message.findUnique({
            where: { id: message_id }
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.sender_id !== currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.message.delete({
            where: { id: message_id }
        });

        const newLastMessage = await prisma.message.findFirst({
            where: { chat_id: chat_id },
            orderBy: { created_at: 'desc' }
        });

        await prisma.chatmember.updateMany({
            where: { chat_id: chat_id },
            data: { 
                last_message_text: newLastMessage ? newLastMessage.content : "Нет сообщений",
                last_message_at: newLastMessage ? newLastMessage.created_at : null
            }
        });

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}