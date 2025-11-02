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

        // Use username as email for Supabase Auth (or convert to email format)
        const email = username.includes('@') ? username : `${username}@app.local`;

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.error('[FormLogin] Supabase signup error:', error);
            return;
        }

        if (!data.user) {
            console.error('[FormLogin] No user data returned from signup');
            return;
        }

        console.log('[FormLogin] Supabase signup successful. User ID:', data.user.id);

        // Save user data to public_users table with the auth user ID
        const result = await SentFormData(email, password, username, data.user.id);
        console.log('[FormLogin] SentFormData result:', result);
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