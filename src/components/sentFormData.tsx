'use server'

import { prisma } from '../../lib/prisma';

export default async function SentFormData(username: string, password: string) {
    const result = await prisma.users.findUnique({
        where: { username }
    })

    if (result) {
        return false
    } else {
        return await prisma.users.create({
            data: { username, password }
        });
    }
}