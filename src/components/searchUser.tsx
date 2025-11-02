'use client'

import { useState, useEffect, useCallback } from "react"
import Search from "@/components/search"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NewChat from "./newchat";
import type { SearchUserResult } from "@/types/user";
import { debouncedAsync } from "@/lib/utils";

export default function SearchUser() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [users, setUsers] = useState<SearchUserResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Define getCurrentUser with useCallback to avoid recreating
    const getCurrentUser = useCallback(async () => {
        const supabase = createClientComponentClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;
        return user;
    }, []);

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
    }, [getCurrentUser]);

    // Debounce search with configurable delay
    useEffect(() => {
        const trimmed = searchQuery.trim();

        // Clear users and reset loading if query is empty
        if (trimmed.length === 0) {
            setUsers([]);
            setIsLoading(false);
            return;
        }

        // Don't search if less than 2 characters
        if (trimmed.length < 2) {
            setIsLoading(false);
            return;
        }

        const cleanup = debouncedAsync({
            callback: async () => {
                const results = await Search(trimmed, currentUserId || undefined);
                return Array.isArray(results) ? results : [];
            },
            delay: 500,
            validate: () => trimmed.length >= 2,
            onStart: () => setIsLoading(true),
            onSuccess: (results) => setUsers(results),
            onError: (err) => {
                setError("Ошибка при поиске пользователей");
                console.error("Search error:", err);
                setUsers([]);
            },
            onFinally: () => setIsLoading(false),
        });

        return cleanup;
    }, [searchQuery, currentUserId]);

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setSearchQuery(value);
        setError(null);

        // Only show loading if the value will trigger search
        if (value.trim().length >= 2) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
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