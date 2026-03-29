'use client'

import { useState } from "react";
import { Lock, User } from 'lucide-react';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation'; // Для перенаправления
import Link from 'next/link';

export default function FormLogin() {
    const supabase = createClient();
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Авторизация через Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: password
            });

            if (error) {
                console.error('[Login] Error:', error.message);
                alert("Ошибка входа: " + error.message);
                return;
            }

            if (data.user) {
                console.log('[Login] Успешный вход:', data.user.id);
                router.refresh(); 
                router.push('/');
            }
        } catch (err) {
            console.error("Critical error during login:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <div className="text-white text-3xl font-bold">M</div>
                </div>

                <h1 className="text-2xl font-bold mb-8">Войти в аккаунт</h1>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    {/* Поле Username */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold mt-8 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100"
                    >
                        {loading ? "Входим..." : "Войти"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-500">
                    Нет аккаунта?{" "}
                    <Link href="/signup" className="text-blue-500 font-medium hover:underline">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
}