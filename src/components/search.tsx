'use server'

import { prisma } from "../../lib/prisma"

export default async function Search (username: string) {
  if (username) {
    const user = await prisma.public_users.findMany({
        where: {
    OR: [
      {
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },
      {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    ],
  },
    });
    return user;
  } else {
    return;
  }
    
}