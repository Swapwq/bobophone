'use server'

import { prisma } from "../../lib/prisma"

export default async function checkUsername(username: string) {
    const user = await prisma.users.findUnique({
        where: { username }
    })

    return !!user;
    
}