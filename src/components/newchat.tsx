'use server';

import { createClient } from "../../lib/supabase";
import { prisma } from "../../lib/prisma";

export default async function NewChat(currentUser : string, user: string) {


    async function New() {
        const supabase = createClient();

        const { data: chat, error } = await supabase
        .from("chat")
        .insert([{ type: "private" }])
        .select()
        .single();

        if (error) console.error(error);

        await supabase.from("chatmember").insert([
        { chat_id: chat.id, user_id: currentUser },
        { chat_id: chat.id, user_id: user }
    ])};

    async function Search() {
        const chats = await prisma.chat.findMany({
            where: {
                chatmember: {
                    some: { user_id: currentUser}
                }
            },
            include: {
                chatmember: true
            }
        });

        const existingChat = chats.find(chat => chat.chatmember.some(m => m.user_id === user));
        return existingChat || null;
    }

    const chat = await Search()

    if (chat) {
        return chat;
    } else { await New() }
}