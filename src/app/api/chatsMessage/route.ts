import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const chatId = url.searchParams.get("chatId");
    if (!chatId) return NextResponse.json([], { status: 400 });

    const messages = await prisma.message.findMany({
        where: {
            chat_id: chatId
        },
        select: {
            sender_id: true,
            content: true,
            created_at: true
        }
    });

    const result = messages.map(m => ({
        sender_id: m.sender_id,
        content: m.content,
        created_at: m.created_at
    }));

    return NextResponse.json(result);
}