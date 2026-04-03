import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chat_id, sender_id, content, reply_to_id } = body; // Добавили деструктуризацию

    if (!chat_id || !sender_id || !content) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        chat_id: chat_id,
        sender_id: sender_id,
        content: content,
        created_at: new Date(),
        reply_to_id: reply_to_id || null // Используем извлеченное значение
      },
      select: {
        id: true,         // ОБЯЗАТЕЛЬНО возвращаем ID
        sender_id: true,
        content: true,
        created_at: true,
        reply_to_id: true, // ВОТ ЭТОГО НЕ ХВАТАЛО! Теперь фронт увидит связь сразу
      },
    });

    const sender = await prisma.public_users.findUnique({
      where: { id: sender_id },
      select: { username: true }
    });

    return NextResponse.json(
      { 
        ...message, 
        sender_username: sender?.username || null 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/sendMessage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}