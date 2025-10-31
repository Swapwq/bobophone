'use client'

import './formLogin.css'
import { useState } from "react";
import { createClient } from '../../lib/supabase';
import { redirect } from 'next/navigation';

export default function Login() {
    const supabase = createClient();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
        async function handleSubmit(e: React.FormEvent) {
            e.preventDefault();

            const { error } = await supabase.auth.signInWithPassword({ email: username, password: password });
            if (error) console.log(error);
            else redirect('/')

        };
    
        return(
            <form onSubmit={handleSubmit}>
                <input className="border-1 border-gray-500 rounded-[5px] w-[280px] h-[30px] px-2 text-sm font-mono mb-[10px] hover:border-[#766ac8] focus:outline-none focus:border-[#8775da] duration-200" placeholder="Username" value={username} type='text' name='username' onChange={(e) => setUsername(e.target.value)}></input>
                <input className="border-1 border-gray-500 rounded-[5px] w-[280px] h-[30px] px-2 text-sm font-mono mb-[10px] hover:border-[#766ac8] focus:outline-none focus:border-[#8775da] duration-200" placeholder="Password" value={password} type='text' name='password' onChange={(e) => setPassword(e.target.value)}></input>
                <div className="flex items-baseline items-center self-start mb-[20px]">
                    <label className='ios-checkbox purple mr-[10px]'>
                        <input type="checkbox" />
                        <div className="checkbox-wrapper">
                        <div className="checkbox-bg"></div>
                        <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
                            <path
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            stroke-width="3"
                            stroke="currentColor"
                            d="M4 12L10 18L20 6"
                            className="check-path"
                            ></path>
                        </svg>
                        </div>
                    </label>
                    <p className="font-light text-[13.5px]">Запомнить меня</p>
                </div>
                <div className="flex flex-col font-sans-serif text-[16px]">
            <button type='submit' className="cursor-pointer w-[280px] h-[38px] bg-[#8774e1] rounded-[8px] mb-[10px] hover:bg-[#9288d3] duration-100">Войти</button>
                </div>
            </form>
        )
    }