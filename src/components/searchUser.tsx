'use client'

import { useState, useEffect, useCallback } from "react"
import Search from "@/components/search"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NewChat from "./newchat";
import type { SearchUserResult } from "@/types/user";

export default function SearchUser() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [users, setUsers] = useState<SearchUserResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user on mount
    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const user = await getCurrentUser();
                setCurrentUserId(user?.id || null);
            } catch (err) {
                console.error("Failed to get current user:", err);
            }
        }
        fetchCurrentUser();
    }, []);

    const performSearch = useCallback(async (query: string) => {
        if (query.trim().length === 0) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const results = await Search(query, currentUserId || undefined);
            setUsers(Array.isArray(results) ? results : []);
        } catch (err) {
            setError("Ошибка при поиске пользователей");
            console.error("Search error:", err);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId]);

    // Debounce search with 500ms delay
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch]);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearchQuery(value);
        setError(null);
        setIsLoading(true); // Show loading immediately when user types
    }

    async function getCurrentUser() {
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        return user;
    }

    async function handleCreateChat(selectedUser: SearchUserResult) {
        if (!selectedUser.id) {
            setError("Некорректный пользователь");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();

            if (!currentUser?.id) {
                setError("Вы не авторизованы");
                return;
            }

            await NewChat(currentUser.id, selectedUser.id);

            // Очищаем поиск после создания чата
            setSearchQuery("");
            setUsers([]);
        } catch (err) {
            setError("Ошибка при создании чата");
            console.error("Create chat error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-[250px]">
            <input
                className="w-[250px]"
                placeholder="Username"
                value={searchQuery}
                type="text"
                name="username"
                onChange={handleSearchChange}
                disabled={isLoading}
            />

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {isLoading && <p className="text-gray-500 text-sm mt-1">Загрузка...</p>}

            {!isLoading && users.length > 0 && users.map((user) => (
                <button
                    key={user.id}
                    className='flex justify-start w-[250px]'
                    onClick={() => handleCreateChat(user)}
                >
                    <p>{user.username || user.email}</p>
                </button>
            ))}

            {!isLoading && searchQuery.trim().length > 0 && users.length === 0 && !error && (
                <p className="text-gray-500 text-sm mt-1">Пользователи не найдены</p>
            )}
        </div>
    )
}