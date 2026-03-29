'use client'

import { useState } from "react";
import { Lock, User } from 'lucide-react';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const supabase = createClient();
    const router = useRouter();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Превращаем ник в тот же формат email, что был при регистрации
        const loginEmail = username.includes('@') ? username : `${username}@app.local`;

        const { error } = await supabase.auth.signInWithPassword({ 
            email: loginEmail, 
            password: password 
        });

        if (error) {
            alert("Ошибка входа: " + error.message);
            setLoading(false);
        } else {
            router.push('/'); // Уходим на главную
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                
                {/* Логотип (как в регистрации) */}
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <div className="text-white text-3xl font-bold">M</div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
                <p className="text-gray-400 text-sm mb-8">Рады видеть тебя снова</p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {/* Поле Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Поле Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Запомнить меня (твой чекбокс, стилизованный под Tailwind) */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="remember" 
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                            Запомнить меня
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold mt-4 hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-blue-100"
                    >
                        {loading ? "Входим..." : "Войти"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="mt-6 text-sm text-gray-500">
                    Нет аккаунта?{" "}
                        <Link href="/signup" className="text-blue-500 font-medium hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}