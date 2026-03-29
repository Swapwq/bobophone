import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
    try {
        const SearchParams = new URL(req.url);
        const userId = SearchParams.searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const user = await prisma.public_users.findUnique({
            where: { id: userId },
            select: { username: true, name: true, phone: true, status: true },
        });

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Failed to fetch profile Info" }, { status: 500 });
    }
}