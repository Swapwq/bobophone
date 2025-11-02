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
    console.log('[Search] Query params:', { trimmedUsername, currentUserId });

    // First, let's check all users in the database
    const allUsers = await prisma.public_users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    console.log('[Search] All users in DB:', allUsers);
    console.log('[Search] Total users count:', allUsers.length);

    // Now search with the query
    const users = await prisma.public_users.findMany({
      where: {
        username: {
          contains: trimmedUsername,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      take: 10,
    });

    console.log('[Search] Search results:', users);
    console.log('[Search] Number of results:', users.length);

    // Filter out users with null id and exclude current user
    const filtered = users.filter((user): user is SearchUserResult => {
      if (user.id === null) {
        console.log('[Search] Filtering out user with null id:', user);
        return false;
      }
      if (currentUserId && user.id === currentUserId) {
        console.log('[Search] Filtering out current user:', user);
        return false;
      }
      return true;
    });

    console.log('[Search] Filtered results:', filtered);
    return filtered;
  } catch (error) {
    console.error("[Search] Error:", error);
    return [];
  }
}