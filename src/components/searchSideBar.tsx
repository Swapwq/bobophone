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
    onChatCreated?: () => void;
    isDark?: boolean;
}

export default function SearchSidebar({ searchQuery, setSearchQuery, currentUserId, onChatCreated, isDark }: SearchSidebarProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

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
            setSearchQuery("");
            setUsers([]);
            onChatCreated?.();
        } catch (err) {
            console.error("Ошибка создания чата:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 relative">
            <div className="relative group">
                <SearchIcon className={`absolute left-3 top-2.5 size-4 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search people..." 
                    className={`w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm transition-all border border-transparent ${
                        isDark 
                        ? 'bg-[#242f3d] text-slate-100 focus:bg-[#2c3949] focus:ring-blue-500/20 focus:border-blue-500/50' 
                        : 'bg-gray-100 text-gray-800 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500/50'
                    }`}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-2.5 size-4 text-blue-500 animate-spin" />
                )}
            </div>

            {/* Результаты поиска поверх списка чатов */}
            {searchQuery.length >= 2 && (
                <div className={`absolute left-4 right-4 mt-2 rounded-xl shadow-2xl border z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 transition-colors ${
                    isDark ? 'bg-[#17212b] border-white/5' : 'bg-white border-gray-100'
                }`}>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div 
                                key={user.id}
                                onClick={() => handleCreateChat(user)}
                                className={`flex items-center p-3 cursor-pointer transition-colors border-b last:border-none group ${
                                    isDark 
                                    ? 'hover:bg-white/5 border-white/5' 
                                    : 'hover:bg-blue-50 border-gray-50'
                                }`}
                            >
                                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate transition-colors ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{user.name}</p>
                                    <p className={`text-[11px] truncate transition-colors ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>@{user.username}</p>
                                </div>
                                <UserPlus size={16} className={`transition-colors ${isDark ? 'text-slate-600 group-hover:text-blue-400' : 'text-gray-300 group-hover:text-blue-500'}`} />
                            </div>
                        ))
                    ) : !isLoading && (
                        <div className={`p-4 text-center text-xs transition-colors ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Никого не нашли</div>
                    )}
                </div>
            )}
        </div>
    );
}