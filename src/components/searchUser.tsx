'use client'

import { useState } from "react"
import Search from "@/components/search"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NewChat from "./newchat";

export default function SearchUser() {
    const [data, setData] = useState();
    const [us, setUs] = useState<any[]>([]);

    async function Handle(e: React.FormEvent) {
        setData(e.target.value);
        e.preventDefault();

        const users = await Search(data);
        setUs(Array.isArray(users) ? users : []);
    }

    async function currentUser() {
        const supabase = createClientComponentClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        return user;

    }

    async function createChat(t : string) {
        const current = await currentUser();
        const userToChat = t;

        NewChat(current?.id, userToChat?.id);
    }

    return (
            <div className="max-w-[250px]">
                <input className="w-[250px]" placeholder="Username" value={data} type="text" name="username" onChange={Handle}></input>
                {us ? us.map((t, i) => (
                <button key={i} className='flex justify-start w-[250px]' onClick={() => createChat(t)}>
                    <p>{t.username}</p>
                </button>
                )) : 'null'}
            </div>
    )
}