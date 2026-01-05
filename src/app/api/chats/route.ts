import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const currentUserId = url.searchParams.get("currentUserId");
  if (!currentUserId) return NextResponse.json([], { status: 400 });

  const members = await prisma.chatmember.findMany({
    where: {
      chat: { chatmember: { some: { user_id: currentUserId } } },
      user_id: { not: currentUserId },
    },
    select: { user_id: true, chat_id: true },
  });

  const userIds = [...new Set(members.map(m => m.user_id).filter((id): id is string => !!id))];

  const users = await prisma.public_users.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });

  const userMap = new Map(users.map(u => [u.id, u.username]));

  const result = members.map(m => ({
    user_id: m.user_id,
    chat_id: m.chat_id,
    username: userMap.get(m.user_id) || null,
  }));

  return NextResponse.json(result);
}
