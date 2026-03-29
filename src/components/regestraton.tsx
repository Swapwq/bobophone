'use client'

import { useState } from "react";
import { Mail, Lock, User, AtSign, ChevronRight } from 'lucide-react'; 
import SentFormData from './sentFormData';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Создаем аккаунт в Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                // 2. Сохраняем расширенные данные в твою таблицу public_users
                // Передаем name и username, которые ввел пользователь
                const result = await SentFormData(email, password, username, name, data.user.id);
                
                // Здесь можно добавить еще один запрос к API, чтобы обновить поле 'name', 
                // если SentFormData его еще не поддерживает
                
                console.log('Регистрация успешна:', result);
                router.push('/'); // Уходим в мессенджер
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <span className="text-white text-3xl font-bold">M</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Создать аккаунт</h1>
                <p className="text-gray-400 text-sm mb-8">Начни общение прямо сейчас</p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    {/* Поле Полное Имя */}
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="text"
                            placeholder="Ваше имя (напр. Иван Иванов)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Поле Username */}
                    <div className="relative">
                        <AtSign className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="text"
                            placeholder="Username (уникальный ник)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Поле Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="email"
                            placeholder="Email адрес"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    {/* Поле Пароль */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400 size-5" />
                        <input
                            type="password"
                            placeholder="Придумайте пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-6 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? "Создаем профиль..." : "Зарегистрироваться"}
                        {!loading && <ChevronRight size={18} />}
                    </button>
                </form>

                <p className="mt-8 text-sm text-gray-500">
                    Уже есть аккаунт? <span onClick={() => router.push('/login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Войти</span>
                </p>
            </div>
        </div>
    );
}