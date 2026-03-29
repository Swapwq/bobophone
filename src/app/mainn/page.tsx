"use client";

import React, { useEffect } from 'react';
import { Search, MessageSquare, User, Settings, Bell, Phone, Video, Send, Paperclip, ChevronRight } from 'lucide-react';
import { 
 Palette, Lock, 
  LogOut, Camera, Moon 
} from 'lucide-react';

import { useState } from 'react';

import NewTypeOfChatMessage from "@/components/NewTypeOfChatMessage";
import Loader from '@/components/Loader';
import { error } from 'console';

type ChatUser = {
  user_id: string;
  chat_id: string;
  username: string;
  last_message_text?: string | null;
  last_message_at?: string | Date | null;
};

export default function Messanger({ currentUserId }: { currentUserId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [usernames, setUsernames] = useState<{ user_id: string; chat_id: string; username: string; last_message_text?: string | null; last_message_at?: string | Date | null }[]>([]);
       const [loadingMessages, setLoadingMessages] = useState(false);
       const [messages, setMessages] = useState<{ sender_id: string; content: string; created_at: Date; sender_username: string }[]>([]);
       const [message, setMessage] = useState("");
       const [sending, setSending] = useState(false);
       const [selectedChatId, setSelectedChatId] = useState('');
       const [profile, setProfile] = useState({
            name: "Ivan Petrov",
            phone: "+(13) 356 7980",
            username: "@ivanp",
            status: "Available"
            });

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
      // Загружаем список чатов
      const chatsRes = await fetch(`/api/chats?currentUserId=${currentUserId}`);
      const chatsData: ChatUser[] = await chatsRes.json();
      setUsernames(chatsData);

      // Загружаем данные профиля
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
      console.error("Ошибка при инициализации данных:", err);
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
    
      if (!usernames.length) return (<div className="flex items-center justify-center h-screen"><Loader /></div>);
      const currentChatUsername = usernames.find(u => u.chat_id === selectedChatId)?.username;

      const lastMessage = messages.at(-1);

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
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 size-4" />
            <input 
              placeholder="Search" 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {usernames.map((u) => {
            const isActive = selectedChatId === u.chat_id;

            return (
                <div 
                key={u.chat_id} 
                className={`flex items-center p-4 cursor-pointer border-b border-gray-50 transition-all ${
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
                }`} 
                onClick={() => {
                    setSelectedChatId(u.chat_id); 
                    loadMessages(u.chat_id);
                }}
                >
                {/* Аватарка: первая буква имени на синем фоне */}
                <div className="w-12 h-12 bg-blue-100 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                    {u.username?.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold text-sm truncate ${isActive ? "text-blue-600" : "text-gray-900"}`}>
                        {u.username}
                    </h3>
                    
                    {/* Реальное время последнего сообщения */}
                    <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0 font-medium">
                        {u.last_message_at ? (
                        new Date(u.last_message_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })
                        ) : (
                        ""
                        )}
                    </span>
                    </div>

                    {/* Реальный текст последнего сообщения */}
                    <p className={`text-xs truncate mt-0.5 ${isActive ? "text-blue-500/80" : "text-gray-500"}`}>
                    {u.last_message_text || "No messages yet"}
                    </p>
                </div>
                </div>
            );
            })}
        </div>
      </div>

      {/* Окно чата */}
      <div className="flex-1 flex flex-col bg-[#f4f7f9]">
        {/* Header */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full mr-3" />
            <div>
              <h2 className="font-bold text-sm">{currentChatUsername}</h2>
              <span className="text-xs text-green-500">online</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Phone size={20} className="hover:text-blue-500 cursor-pointer" />
            <Video size={20} className="hover:text-blue-500 cursor-pointer" />
            <Search size={20} className="hover:text-blue-500 cursor-pointer" />
          </div>
        </div>

        <NewTypeOfChatMessage messages={messages} currentUserId={currentUserId}/>

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
                onChange={(e) => setMessage(e.target.value)}
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
            <button className="flex items-center gap-3 text-red-500 font-medium hover:bg-red-50 w-full p-3 rounded-xl transition-all">
              <LogOut size={20} />
              Logout
            </button>
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
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
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
  </>);
};  

// Вспомогательные компоненты для чистоты кода
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
  onChange: (val: string) => void // Добавляем этот тип сюда
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