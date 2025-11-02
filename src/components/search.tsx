'use server'

import { prisma } from "../../lib/prisma"
import type { SearchUserResult } from "@/types/user";

export default async function Search(username: string | undefined, currentUserId?: string): Promise<SearchUserResult[]> {
  // Validate and sanitize input
  if (!username || typeof username !== 'string') {
    return [];
  }

  const trimmedUsername = username.trim();

  // Minimum search length to prevent excessive queries
  if (trimmedUsername.length < 2) {
    return [];
  }

  try {
    const users = await prisma.public_users.findMany({
      where: {
        AND: [
          {
            username: {
              contains: trimmedUsername,
              mode: 'insensitive',
            },
          },
          // Exclude current user from results
          ...(currentUserId ? [{ id: { not: currentUserId } }] : []),
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10, // Limit results to 10 users
    });

    // Filter out users with null id (safety check)
    return users.filter((user: { id: string | null; username: string | null; email: string }): user is SearchUserResult => user.id !== null);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}