"use client";

import React, { use, useCallback, useEffect } from 'react';
import { Search, MessageSquare, User, Settings, Bell, Phone, Video, Send, Paperclip, ChevronRight } from 'lucide-react';
import { 
 Palette, Lock, 
  LogOut, Camera, Moon 
} from 'lucide-react';

import { useState } from 'react';

import NewTypeOfChatMessage from "@/components/NewTypeOfChatMessage";
import { createClient } from '../../lib/supabase';
import SearchSidebar from './searchSideBar';
import LogoutAction from './signout';
import { mark } from 'framer-motion/client';
import { markMessagesAsRead } from './markAsRead';
import { channel } from 'diagnostics_channel';

const supabase = createClient();

type ChatUser = {
  user_id: string;
  chat_id: string;
  username: string;
  name: string;
  phone: string;
  last_message_text?: string | null;
  last_message_at?: string | Date | null;
};

export default function Messanger({ currentUserId }: { currentUserId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [usernames, setUsernames] = useState<{ user_id: string; chat_id: string; username: string; name: string; phone: string; last_message_text?: string | null; last_message_at?: string | Date | null; peerLastReadAt?: string | Date | null }[]>([]);
       const [loadingMessages, setLoadingMessages] = useState(false);
       const [messages, setMessages] = useState<any[]>([]);
       const [message, setMessage] = useState("");
       const [sending, setSending] = useState(false);
       const [selectedChatId, setSelectedChatId] = useState('');
       const [typingUser, setTypingUser] = useState<string | null>(null);
       const [searchQuery, setSearchQuery] = useState("");
       const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
       const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
       const [profile, setProfile] = useState({
            name: "Ivan Petrov",
            phone: "+(13) 356 7980",
            username: "@ivanp",
            status: "Available"
            });

      const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

      let lastTypingTime = 0;

      function handleTyping() {
        const now = Date.now();

        if (now - lastTypingTime > 2000) {
          lastTypingTime = now;
          supabase.channel(`chat-${selectedChatId}`).send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              username: profile.username,
            },
          })
        }
      }

      function PlaySound() {
          const audio = new Audio('/notification.mp3');

          audio.volume = 0.5

          audio.play().catch(error => {
              console.warn("Автовоспроизведение звука заблокировано. Кликните по странице!", error);
          });
      };

      useEffect(() => {
        if (!currentUserId) return;

        const online = supabase.channel('online-users', {
          config: {
            presence: {
              key: currentUserId,
            },
          },
        });

        online.on('presence', { event: 'sync' }, () => {
          const newState = online.presenceState();
          const onlineUsersIds = Object.keys(newState);
          console.log("Синхронизация присутствия. Онлайн пользователи:", onlineUsersIds);
          setOnlineUsers(onlineUsersIds);
        }).on('presence', { event: 'join' }, ({ key: currentUserId }) => {
          console.log(`Пользователь ${currentUserId} онлайн`);
        }).on('presence', { event: 'leave' }, ({ key: currentUserId }) => {
          console.log(`Пользователь ${currentUserId} офлайн`);
        }).subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await online.track({ online_at: new Date().toISOString(),
              username: profile.username
             });
          }
        });

        function handeTabClose() {
          online.untrack();
        }

        window.addEventListener('beforeunload', handeTabClose);

        return () => {
          window.removeEventListener('beforeunload', handeTabClose);
          supabase.removeChannel(online);
        };
      }, [currentUserId, profile.username]);

      useEffect(() => {
        if (selectedChatId && currentUserId) {
          markMessagesAsRead(currentUserId, selectedChatId);
      }
      }, [selectedChatId, messages.length]);

      useEffect(() => {
        if (!selectedChatId || !currentUserId) return;

        const channel = supabase.channel(`chat-${selectedChatId}`);

        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'message',
              filter: `chat_id=eq.${selectedChatId}`,
            },
            (payload) => {
              const newMessage = payload.new;
              if (payload.new.sender_id !== currentUserId) {
                setUsernames(prev => prev.map(chat => 
                  chat.chat_id === selectedChatId 
                    ? { ...chat, peerLastReadAt: payload.new.last_read_at } 
                    : chat
                ));
              }
              if (newMessage.sender_id === currentUserId) return;

              if (newMessage.sender_id !== currentUserId) {
                PlaySound();
              }

              setMessages((prev) => {
                if (prev.some((m) => m.id === newMessage.id)) return prev;
                return [...prev, { 
                  ...newMessage, 
                  created_at: new Date(newMessage.created_at) 
                }];
              });
            }
          )
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chatmember', filter: `chat_id=eq.${selectedChatId}` }, 
            (payload) => {
              if (payload.new.user_id !== currentUserId) {
                console.log("Получено обновление статуса прочтения от собеседника:", payload.new.user_id, payload.new.last_read_at);

                setUsernames((prev) => prev.map(chat =>
                  chat.chat_id === selectedChatId 
                    ? { ...chat, peerLastReadAt: payload.new.last_read_at } 
                    : chat
                ));
              }
            })


          // Слушаем статус "печатает" (Broadcast)
          .on('broadcast', { event: 'typing' }, (payload) => {
            // Игнорируем, если это пришло от нас самих (хотя в Broadcast по умолчанию self: false)
            if (payload.payload.username === profile.username) return;

            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            setTypingUser(payload.payload.username);
            
            // Таймер очистки (используем window.setTimeout для ясности)
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
              typingTimeoutRef.current = null;
            }, 3000);

          })
          .subscribe((status) => {
            console.log(`Realtime status для чата ${selectedChatId}:`, status);
          });

        return () => {
          supabase.removeChannel(channel);
        };
      }, [selectedChatId, currentUserId]); // Убрал supabase из зависимостей, он внешний

// Функция для обновления полей
        const handleProfileChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        };

        async function saveProfileChanges() {
        try {
            const res = await fetch("/api/changeProfile", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUserId,
                    name: profile.name,
                    phone: profile.phone,
                    username: profile.username,
                    status: profile.status
                }),
            });

            if (!res.ok) {
                alert("Profile updated successfully!");
            } else {
                throw new Error("Failed to update profile");
            }
        

        } catch (error) {
            console.error("Error saving profile changes:", error);
        } finally {
            setSending(false);
        }
    }
    
      // 1. Эффект для первичной загрузки данных (Чаты + Профиль)
useEffect(() => {
  async function loadInitialData() {
    if (!currentUserId) return;

    try {
      // 1. Загружаем список чатов
      const chatsRes = await fetch(`/api/chats?currentUserId=${currentUserId}`);
      const chatsData: ChatUser[] = await chatsRes.json();
      
      setUsernames(chatsData);

      // ПРОВЕРКА: Если чатов 0 — просто выключаем лоадер и выходим
      if (!chatsData || chatsData.length === 0) {
        setLoadingMessages(false);
        console.log("У пользователя еще нет чатов.");
        return; 
      }

      // 2. Если чаты есть — выбираем самый верхний
      const lastChat = chatsData[0];
      setSelectedChatId(lastChat.chat_id);
      loadMessages(lastChat.chat_id);

      // 3. Загружаем профиль (твой код)
      const profileRes = await fetch(`/api/getProfile?userId=${currentUserId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          name: profileData.name || 'No name',
          phone: profileData.phone || 'No phone',
          username: profileData.username ? `@${profileData.username}` : 'No username',
          status: profileData.status || 'No status'
        });
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
      setLoadingMessages(false);
    }
  }

  loadInitialData();
}, [currentUserId]);

// 2. Функция загрузки сообщений конкретного чата
    async function loadMessages(chatId: string) {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chatsMessage?chatId=${chatId}`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Ошибка загрузки сообщений:", err);
      } finally {
        setLoadingMessages(false);
      }
    }

    // 3. Функция отправки сообщения
    async function sendMessage() {
      if (!message.trim() || !selectedChatId) return;

      setSending(true);

      try {
        const sentTime = new Date().toISOString();
        const res = await fetch("/api/sendMessage", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: selectedChatId,
            sender_id: currentUserId,
            content: message,
            created_at: sentTime,
          })
        });

        if (!res.ok) throw new Error("Failed to send");

        const rawMessage = await res.json();

        // Обновляем список сообщений
        setMessages(prev => [
          ...prev,
          {
            id: rawMessage.id,
            sender_id: rawMessage.sender_id,
            content: rawMessage.content,
            created_at: new Date(rawMessage.created_at),
            sender_username: rawMessage.sender_username,
          },
        ]);

        // Обновляем список чатов слева
        setUsernames(prevChats => {
          return prevChats
            .map(chat => {
              if (chat.chat_id === selectedChatId) {
                return {
                  ...chat,
                  last_message_text: rawMessage.content,
                  last_message_at: rawMessage.created_at
                };
              }
              return chat;
            })
            .sort((a, b) => {
              const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return dateB - dateA;
            });
        });

    setMessage(''); // Очищаем инпут
  } catch (err) {
    console.error("Ошибка отправки:", err);
  } finally {
    setSending(false);
  }
}

const refreshChatList = useCallback(async () => {
  if (!currentUserId) return;
  const res = await fetch(`/api/chats?currentUserId=${currentUserId}`);
  const data = await res.json();
  setUsernames(data);
},[currentUserId]);

    const currentChat = usernames.find(u => u.chat_id === selectedChatId);
    const currentChatInfo = {
      username: currentChat?.username || 'Выберите чат',
      user_id: currentChat?.user_id || 'Не выбран чат',
    }

  return (<>
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Левый сайдбар (Иконки) */}
      <div className="w-16 bg-blue-600 flex flex-col items-center py-6 space-y-8 text-white">
        <div className="bg-white/20 p-2 rounded-xl"><MessageSquare size={24} /></div>
        <div className="text-white/60 hover:text-white cursor-pointer"><User size={24} /></div>
        <button className="text-white/60 hover:text-white cursor-pointer" onClick={() => setIsOpen(true)}>
          <Settings size={24} />
        </button>
        <div className="mt-auto pb-4 text-white/60 hover:text-white cursor-pointer"><Bell size={24} /></div>
      </div>

      {/* Список чатов (как в Telegram) */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <SearchSidebar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currentUserId={currentUserId} 
          onChatCreated={refreshChatList}
        />
        <div className="flex-1 overflow-y-auto bg-white border-r border-gray-100">
          {/* ПРОВЕРКА: Если массив пустой или еще грузится */}
          {usernames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              {/* Иконка или просто эмодзи */}
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Чатов пока нет</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[180px]">
                Найдите собеседника по поиску или подождите первого сообщения
              </p>
              
              {/* Кнопка-заглушка для будущего поиска */}
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                Найти людей
              </button>
            </div>
          ) : (
            usernames.map((chat) => (
              <div
                key={chat.chat_id}
                onClick={() => {
                  setSelectedChatId(chat.chat_id);
                  loadMessages(chat.chat_id);
                }}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                  selectedChatId === chat.chat_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                {/* Аватарка (заглушка) */}
                <div className='relative flex-shrink-0'>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {chat.username?.[0]?.toUpperCase() || 'U'}
                  </div>

                  {onlineUsers.includes(chat.user_id) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm z-10"></span>
                  )}
                </div>

                {/* Инфо о чате */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {chat.username || 'Unknown User'}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {chat.last_message_text || 'Нет сообщений'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 flex flex-col bg-[#f4f7f9]">
        {/* Header */}
          <div className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center">
              <div 
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
                  onClick={() => setIsUserProfileOpen(true)}
                >
              {/* Аватарка собеседника с индикатором */}
              <div className="relative mr-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {/* Достаем первую букву ника или "U" если пусто */}
                  {currentChat?.name ? currentChat.name[0].toUpperCase() : 'U'}
                </div>
                
                {/* Индикатор онлайн прямо на аватарке */}
                {currentChat?.user_id && onlineUsers.includes(currentChat.user_id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-gray-900">
                    {currentChat?.name || "Загрузка..."}
                  </h2>
                </div>
                {/* Текстовый статус под именем */}
                {typingUser ? (
                  <p className="text-[10px] text-blue-500 italic animate-pulse">
                    {typingUser} печатает...
                  </p>
                ) : (
                  <p className="text-[10px] font-medium transition-colors">
                    {currentChat?.user_id && onlineUsers.includes(currentChat.user_id) ? (
                      <span className="text-green-500">в сети</span>
                    ) : (
                      <span className="text-gray-400">не в сети</span>
                    )}
                  </p>
                )}
              </div>
            </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
              <Phone size={20} className="hover:text-blue-500 cursor-pointer transition-all active:scale-90" />
              <Video size={20} className="hover:text-blue-500 cursor-pointer transition-all active:scale-90" />
              <Search size={20} className="hover:text-blue-500 cursor-pointer transition-all active:scale-90" />
            </div>
          </div>

        <NewTypeOfChatMessage messages={messages} currentUserId={currentUserId} peerLastReadAt={currentChat?.peerLastReadAt} />

         {/* Input */}

        {/* Input */}
        {/* Блок ввода сообщения */}
        <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
            
            {/* Иконка скрепки (просто для визуала) */}
            <button type="button" className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0 p-1">
            <Paperclip size={22} strokeWidth={1.5} />
            </button>
            
            {/* Форма с твоей логикой */}
            <form 
            className="flex-1 flex items-center gap-4" 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
            {/* Поле ввода */}
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 flex items-center transition-all focus-within:border-blue-300 focus-within:bg-white shadow-sm">
                <input 
                type="text"
                value={message}
                onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                placeholder="Write a message..." 
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                />
            </div>

            {/* Твоя кнопка отправки в новом стиле */}
            <button 
                type="submit" 
                disabled={sending || !message.trim()}
                className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full text-white shadow-lg shadow-blue-100 transition-all active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
                <Send size={18} strokeWidth={2} />
            </button>
            </form>
            
        </div>
        </div>
      </div>
    </div>
    {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center' onClick={() => setIsOpen(false)}>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-10 ">
      <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl flex overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Левая панель меню */}
        <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            <SettingsItem icon={<User size={20} />} label="Account" active />
            <SettingsItem icon={<Bell size={20} />} label="Notifications" />
            <SettingsItem icon={<Palette size={20} />} label="Appearance" />
            <SettingsItem icon={<Lock size={20} />} label="Privacy & Security" />
          </nav>

          <div className="p-6 mt-auto border-t border-gray-100">
            <form action={LogoutAction}>
            <button className="flex items-center gap-3 text-red-500 font-medium hover:bg-red-50 w-full p-3 rounded-xl transition-all cursor-pointer">
              <LogOut size={20} />
              Logout
            </button>
            </form>
          </div>
        </div>

        {/* Правая панель с контентом (как на картинке) */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-2xl">
            {/* Профиль заголовок */}
            <div className="flex items-center gap-6 mb-10">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white border-2 border-white shadow-sm hover:bg-blue-600">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-green-500 flex items-center gap-1 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online Status
                </p>
              </div>
            </div>
            {/* Секция Account Info */}
            <section className="mb-10">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Info</h3>
            <div className="space-y-6">
                <InfoRow 
                label="Name" 
                value={profile.name} 
                onChange={(val) => handleProfileChange('name', val)} 
                />
                <InfoRow 
                label="Phone" 
                value={profile.phone} 
                onChange={(val) => handleProfileChange('phone', val)} 
                />
                <InfoRow 
                label="Username" 
                value={profile.username} 
                onChange={(val) => handleProfileChange('username', val)} 
                />
                <InfoRow 
                label="Status" 
                value={profile.status} 
                onChange={(val) => handleProfileChange('status', val)} 
                />
                <button 
                onClick={saveProfileChanges}
                disabled={sending}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {sending ? "Saving..." : "Save Changes"}
                </button>
            </div>
            </section>

            {/* Секция Appearance (как на картинке) */}
            <section className="mb-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Appearance</h3>
              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl w-fit">
                <button className="px-6 py-2 bg-white rounded-xl shadow-sm text-sm font-bold">Light</button>
                <button className="px-6 py-2 text-gray-500 hover:text-gray-900 text-sm font-bold flex items-center gap-2">
                  <Moon size={16} />
                  Dark Mode
                </button>
              </div>
            </section>

            {/* Account Management */}
            <section>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Management</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-700">Change Password</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </div>
    )}
    {isUserProfileOpen && currentChat && (
        /* Overlay — затемнение и блюр */
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setIsUserProfileOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Чтобы модалка не закрывалась при клике внутри
          >
            {/* Верхняя декоративная часть (Шапка карточки) */}
            <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
              <button 
                onClick={() => setIsUserProfileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <Settings size={18} /> {/* Или крестик X */}
              </button>
            </div>

            {/* Основной контент */}
            <div className="px-8 pb-8 -mt-12 flex flex-col items-center">
              {/* Аватарка с рамкой */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
                  <div className="w-full h-full bg-blue-100 rounded-[22px] flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {currentChat.username[0].toUpperCase()}
                  </div>
                </div>
                {/* Индикатор онлайн */}
                {onlineUsers.includes(currentChat.user_id) && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
                )}
              </div>

              {/* Имя и статус */}
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-gray-900">{currentChat.name}</h2>
                <p className="text-sm font-medium text-gray-400 mt-1">
                  {onlineUsers.includes(currentChat.user_id) ? 'В сети' : 'Был(а) недавно'}
                </p>
              </div>

              {/* Инфо-блок */}


              <div className="w-full mt-8 space-y-3">

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Full Name</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {currentChat.name || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Блок с Телефоном */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {currentChat.phone || "Hidden"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Username</p>
                    <p className="text-sm font-semibold text-gray-800">@{currentChat.username.toLowerCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Lock size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">User ID</p>
                    <p className="text-[10px] font-mono text-gray-500 truncate">{currentChat.user_id}</p>
                  </div>
                </div>
              </div>

              {/* Кнопка действия */}
              <button 
                onClick={() => setIsUserProfileOpen(false)}
                className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Написать сообщение
              </button>
            </div>
          </div>
        </div>
      )}
  </>);
};  


function SettingsItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
    }`}>
      {icon}
      <span className="font-bold">{label}</span>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void
}) {
  return (
    <div className="flex flex-col border-b border-gray-50 pb-3 transition-all focus-within:border-blue-400">
      <span className="text-xs text-gray-400 mb-1 font-medium">{label}</span>
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-gray-800 font-semibold bg-transparent outline-none border-none p-0 focus:ring-0 w-full placeholder:text-gray-300 transition-colors"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}