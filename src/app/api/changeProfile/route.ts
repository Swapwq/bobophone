import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {user_id, name, phone, username, status} = body;

        if (!user_id) {
            return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
        }

        const cleanUsername = username ? username.replace(/^@/, "") : username;

        const updatedUser = await prisma.public_users.update({
            where: { id: user_id },
            data: {
                name,
                phone,
                username: cleanUsername,
                status,
            },
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile Info" }, { status: 500 });
    }
}