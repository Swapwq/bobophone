'use server'

import { prisma } from "../../lib/prisma"
import type { SearchUserResult } from "@/types/user";

export default async function Search(
  username: string | undefined, 
  currentUserId?: string
): Promise<SearchUserResult[]> {
  
  // 1. Валидация
  if (!username || typeof username !== 'string') return [];

  const trimmedQuery = username.trim();
  if (trimmedQuery.length < 2) return [];

  try {
    const users = await prisma.public_users.findMany({
      where: {
        username: { 
          contains: trimmedQuery, 
          mode: 'insensitive' 
        },
        NOT: {
          id: currentUserId,
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
      take: 10,
    });

    // 3. Возвращаем результат
    // Фильтруем на случай, если id в схеме помечен как nullable
    return users.filter((u): u is SearchUserResult => u.id !== null);

  } catch (error) {
    console.error("[Search Server Action] Error:", error);
    return [];
  }
}