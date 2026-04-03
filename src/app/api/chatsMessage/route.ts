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
        orderBy: { created_at: 'asc' },
        select: {
        id: true,
          sender_id: true,
          content: true,
          created_at: true,
          is_edited: true,
            reply_to_id: true
        }
          
    });

        const messagesArray = Array.isArray(messages) ? messages : [messages];
        const senderIds = messages
            .map(m => m.sender_id)
            .filter((id): id is string => !!id && id !== null && id !== undefined);
    
        const senders = await prisma.public_users.findMany({
          where: { id: { in: senderIds }},
          select: {id: true, username: true, name: true}
        })
    
        const result = messagesArray.map(msg => ({
          ...msg, sender_username: senders.find(s => s.id === msg.sender_id)?.username || null, sender_name: senders.find(s => s.id === msg.sender_id)?.name || null
        }));

    return NextResponse.json(result);
}