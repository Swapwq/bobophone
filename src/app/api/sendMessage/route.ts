import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chat_id, sender_id, content } = body;

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
      },
      select: {
        sender_id: true,
        content: true,
        created_at: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/chatsMessage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
