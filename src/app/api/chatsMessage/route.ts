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
        id: true,
          sender_id: true,
          content: true,
          created_at: true
        }
          
    });

        const messagesArray = Array.isArray(messages) ? messages : [messages];
        const senderIds = messages
            .map(m => m.sender_id)
            .filter((id): id is string => !!id && id !== null && id !== undefined);
    
        const senders = await prisma.public_users.findMany({
          where: { id: { in: senderIds }},
          select: {id: true, username: true}
        })
    
        const result = messagesArray.map(msg => ({
          ...msg, sender_username: senders.find(s => s.id === msg.sender_id)?.username || null
        }));

    return NextResponse.json(result);
}