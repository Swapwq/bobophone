'use server';

import { prisma } from "../../lib/prisma";
import type { PrismaClient } from "@/generated/prisma";

export default async function NewChat(currentUserId: string, targetUserId: string) {
  // Input validation
  if (!currentUserId || !targetUserId) {
    throw new Error("Both currentUserId and targetUserId are required");
  }

  if (typeof currentUserId !== 'string' || typeof targetUserId !== 'string') {
    throw new Error("User IDs must be strings");
  }

  // Prevent creating chat with self
  if (currentUserId === targetUserId) {
    throw new Error("Cannot create chat with yourself");
  }

  try {
    // Search for existing private chat between these two users using optimized query
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: "private",
        chatmember: {
          every: {
            OR: [
              { user_id: currentUserId },
              { user_id: targetUserId }
            ]
          }
        }
      },
      include: {
        chatmember: {
          where: {
            OR: [
              { user_id: currentUserId },
              { user_id: targetUserId }
            ]
          }
        }
      }
    });

    // Verify that the chat has exactly 2 members and they are the correct users
    if (existingChat && existingChat.chatmember.length === 2) {
      const memberIds = existingChat.chatmember.map((m: { user_id: string | null }) => m.user_id);
      if (memberIds.includes(currentUserId) && memberIds.includes(targetUserId)) {
        return existingChat;
      }
    }

    // Create new chat with members in a transaction
    const newChat = await prisma.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => {
      // Create the chat
      const chat = await tx.chat.create({
        data: {
          type: "private",
          chatmember: {
            create: [
              { user_id: currentUserId },
              { user_id: targetUserId }
            ]
          }
        },
        include: {
          chatmember: true
        }
      });

      return chat;
    });

    return newChat;

  } catch (error) {
    console.error("NewChat error:", error);
    throw new Error("Failed to create or find chat");
  }
}