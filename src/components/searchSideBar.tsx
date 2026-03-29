'use client'

import { useState, useEffect, useCallback } from "react"
import { Search as SearchIcon, Loader2, UserPlus } from "lucide-react"
import SearchAction from "@/components/search" // Твоя функция поиска в БД
import NewChat from "./newchat"; // Твоя функция создания чата
import { createClient } from '../../lib/supabase';
import { debouncedAsync } from "@/lib/utils";

interface SearchSidebarProps {
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    currentUserId: string;
}

export default function SearchSidebar({ searchQuery, setSearchQuery, currentUserId }: SearchSidebarProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    // Логика поиска (Debounce)
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (trimmed.length < 2) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        const cleanup = debouncedAsync({
            callback: async () => {
                const results = await SearchAction(trimmed, currentUserId);
                return Array.isArray(results) ? results : [];
            },
            delay: 400,
            validate: () => trimmed.length >= 2,
            onStart: () => setIsLoading(true),
            onSuccess: (results) => setUsers(results),
            onError: (err) => {
                console.error(err);
                setUsers([]);
            },
            onFinally: () => setIsLoading(false),
        });

        return cleanup;
    }, [searchQuery, currentUserId]);

    const handleCreateChat = async (user: any) => {
        try {
            setIsLoading(true);
            await NewChat(currentUserId, user.id);
            setSearchQuery(""); // Закрываем поиск
            setUsers([]);
            // Здесь можно добавить window.location.reload() или обновление списка чатов
        } catch (err) {
            console.error("Ошибка создания чата:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 relative">
            <div className="relative group">
                <SearchIcon className="absolute left-3 top-2.5 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people..." 
                    className="w-full pl-10 pr-10 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-sm transition-all border border-transparent focus:border-blue-500/50"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-2.5 size-4 text-blue-500 animate-spin" />
                )}
            </div>

            {/* Результаты поиска поверх списка чатов */}
            {searchQuery.length >= 2 && (
                <div className="absolute left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div 
                                key={user.id}
                                onClick={() => handleCreateChat(user)}
                                className="flex items-center p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none group"
                            >
                                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                                </div>
                                <UserPlus size={16} className="text-gray-300 group-hover:text-blue-500" />
                            </div>
                        ))
                    ) : !isLoading && (
                        <div className="p-4 text-center text-xs text-gray-400">Никого не нашли</div>
                    )}
                </div>
            )}
        </div>
    );
}