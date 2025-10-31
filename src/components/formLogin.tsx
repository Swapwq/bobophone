'use client'

import './formLogin.css'
import { useState } from "react";
import SentFormData from './sentFormData';
import { createClient } from '../../lib/supabase';

export default function FormLogin() {
    const supabase = createClient();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    async function handleSubmit (e: React.FormEvent) {
        e.preventDefault();

        const { data, error } = await supabase.auth.signUp({ email: `${username}`, password: `${password}` });
        if (error) console.log(error);
            else console.log('good');

        SentFormData(username, password);
    };

    return(
        <form onSubmit={handleSubmit}>
            <input className='border-1 border-gray-500 rounded-[5px] w-[280px] h-[30px] px-2 text-sm font-mono mb-[10px] hover:border-[#766ac8] focus:outline-none focus:border-[#8775da] duration-200' placeholder="Username" value={username} type='text' name='username' onChange={(e) => setUsername(e.target.value)}></input>
            <input className="border-1 border-gray-500 rounded-[5px] w-[280px] h-[30px] px-2 text-sm font-mono mb-[10px] hover:border-[#766ac8] focus:outline-none focus:border-[#8775da] duration-200" placeholder="Password" value={password} type='text' name='password' onChange={(e) => setPassword(e.target.value)}></input>
            <div className="flex flex-col font-sans-serif text-[16px]">
        <button type='submit' className="cursor-pointer w-[280px] h-[38px] bg-[#8774e1] rounded-[8px] mt-[50px] hover:bg-[#9288d3] duration-100">Зарегестрироваться</button>
            </div>
        </form>
    )
}