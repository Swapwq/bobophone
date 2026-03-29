'use client'

import { useState } from "react";
import { Mail, Lock, User } from 'lucide-react'; // Добавил иконку User
import { SentFormData } from './sentFormData';
import { createClient } from '../../lib/supabase';
import Link from 'next/link';

export default function FormLogin() {
    const supabase = createClient();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Логика формирования email из username
        const email = username.includes('@') ? username : `${username}@app.local`;

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                console.error('[FormLogin] Supabase signup error:', error.message);
                alert(error.message);
                return;
            }

            if (data.user) {
                console.log('[FormLogin] Signup successful. ID:', data.user.id);
                
                // Создаем переменную fullName (с маленькой буквы, так принято)
                const fullName = username; 

                // Передаем её четвертым аргументом
                const result = await SentFormData(
                    email, 
                    password, 
                    username, 
                    fullName, 
                    data.user.id
                );
                
                console.log('[FormLogin] SentFormData result:', result);
                alert("Регистрация успешна!");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                {/* Логотип приложения */}
                <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <div className="text-white text-3xl font-bold">M</div>
                </div>

                <h1 className="text-2xl font-bold mb-8">Создать аккаунт</h1>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold mt-8 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100"
                    >
                        {loading ? "Загрузка..." : "Зарегистрироваться"}
                    </button>
                </form>
                <p className="mt-6 text-sm text-gray-500">
                    Уже есть аккаунт?{" "}
                    <Link href="/login" className="text-blue-500 font-medium hover:underline">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}