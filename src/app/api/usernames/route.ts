import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return NextResponse.json([], { status: 400 });

    const username = await prisma.public_users.findUnique({
        where: {
            id: userId
        },
        select: {
            username: true
        }
    });

    return NextResponse.json(username);
}