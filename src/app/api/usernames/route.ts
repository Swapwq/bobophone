import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return NextResponse.json([], { status: 400 });

    const profile = await prisma.public_users.findUnique({
        where: {
            id: userId
        },
        select: {
            username: true,
            name: true
        }
    });

    return NextResponse.json(profile);
}