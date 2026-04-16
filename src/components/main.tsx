"use client";

import React, { use, useCallback, useEffect } from 'react';
import { Search, MessageSquare, User, Settings, Bell, Phone, Video, Send, Paperclip, ChevronRight, X, UserPlus, Users, User2, UserStar, Plus, ChevronLeft, Save, Smile, AtSign, ShieldCheck, Check } from 'lucide-react';
import { 
 Palette, Lock, 
  LogOut, Camera, Moon 
} from 'lucide-react';

import { useState } from 'react';

import NewTypeOfChatMessage from "@/components/NewTypeOfChatMessage";
import { createClient } from '../../lib/supabase';
import SearchSidebar from './searchSideBar';
import LogoutAction from './signout';
import { mark, pre, s } from 'framer-motion/client';
import { markMessagesAsRead } from './markAsRead';
import { channel } from 'diagnostics_channel';

const supabase = createClient();

type ChatUser = {
  user_id: string;
  chat_id: string;
  username: string;
  name: string;
  type: 'private' | 'group';
  phone: string;
  last_message_text?: string | null;
  last_message_at?: string | Date | null;
};

export default function Messanger({ currentUserId }: { currentUserId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [usernames, setUsernames] = useState<{ user_id: string; chat_id: string; username: string; name: string; phone: string; last_message_text?: string | null; last_message_at?: string | Date | null; peerLastReadAt?: string | Date | null; type: 'private' | 'group' }[]>([]);
       const [loadingMessages, setLoadingMessages] = useState(false);
       const [messages, setMessages] = useState<any[]>([]);
       const [message, setMessage] = useState("");
       const [sending, setSending] = useState(false);
       const [selectedChatId, setSelectedChatId] = useState('');
       const [typingUser, setTypingUser] = useState<string | null>(null);
       const [searchQuery, setSearchQuery] = useState("");
       const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
       const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
       const [editingMessage, setEditingMessage] = useState<any | null>(null);
       const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
       const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
       const [groupName, setGroupName] = useState("");
       const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
       const [profile, setProfile] = useState({
            name: "Ivan Petrov",
            phone: "+(13) 356 7980",
            username: "@ivanp",
            status: "Available"
            });

      const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

      let lastTypingTime = 0;

      async function createGroup() {
        if (!groupName|| selectedUsers.length === 0) return;

        const res = await fetch("/api/createGroup", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: selectedUsers,
            groupName,
            currentUserId,
          }),
        });

        if (res.ok) {
          const newChat = await res.json();
          setSelectedChatId(newChat.chat_id);
          refreshChatList();
          setIsGroupModalOpen(false);
        }
      }

      const truncateText = (text: string, maxLength: number = 160) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
      };

      const refreshChatList = useCallback(async () => {
      if (!currentUserId) return;
      const res = await fetch(`/api/chats?currentUserId=${currentUserId}`);
      const data = await res.json();
      
      // ВАЖНО: Мы просто сетим новые данные, не добавляя их к старым
      setUsernames(data); 
    }, [currentUserId]);

      function startEdit(message: any) {
          setEditingMessage(message);
          setMessage(message.content);
        }
      
      function startReply(message: any) {
        setReplyingToMessage(message);
        setEditingMessage(null);
        setMessage('');

        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          input?.focus();
      };

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
      if (!currentUserId) return;

      // Слушаем появление новых записей в chatmember, где user_id = наш ID
      const channel = supabase
        .channel('global-chat-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chatmember',
            filter: `user_id=eq.${currentUserId}`,
          },
          async (payload) => {
            console.log("Вас добавили в новый чат!", payload);
            
            // Когда нас добавили в чат, просто заново запрашиваем список чатов с сервера
            await refreshChatList();
            
            // Опционально: можно проиграть звук уведомления
            PlaySound();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [currentUserId, refreshChatList]);

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
                // Если сообщение уже есть в списке (добавлено локально), 
                // обновляем его данными из БД (там уже точно есть ID)
                if (prev.some((m) => m.id === newMessage.id)) {
                    return prev.map(m => m.id === newMessage.id ? {
                        ...m,
                        ...newMessage,
                        created_at: new Date(newMessage.created_at),
                        reply_to_id: newMessage.reply_to_id // Явно прописываем
                    } : m);
                }
                
                // Если это чужое сообщение:
                return [...prev, { 
                  ...newMessage, 
                  created_at: new Date(newMessage.created_at),
                  reply_to_id: newMessage.reply_to_id // Явно прописываем
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
            }
          )
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message', filter: `chat_id=eq.${selectedChatId}` },
            (payload) => {
              const deletedId = payload.old.id;

              setMessages((prev) => {
                const updated = prev.filter(m => m.id !== deletedId);
                
                // Если удалили последнее сообщение — обновляем сайдбар
                const newLast = updated[updated.length - 1];
                setUsernames(chats => chats.map(c => 
                  c.chat_id === selectedChatId 
                    ? { ...c, last_message_text: newLast?.content || "Нет сообщений" } 
                    : c
                ));
                
                return updated;
              });
            }
          )
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'message', filter: `chat_id=eq.${selectedChatId}` },
            (payload) => {
              const updatedMsg = payload.new;

              setMessages((prev) => {
                const updated = prev.map(m => m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m);
                
                if (updated[updated.length - 1]?.id === updatedMsg.id) {
                  setUsernames(chats => chats.map(c => 
                    c.chat_id === selectedChatId ? { ...c, last_message_text: updatedMsg.content } : c
                  ));
                }
                return updated;
              });
            }
          )

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

        const saveProfileChanges = async () => {
        setSending(true);
        try {
          const response = await fetch('/api/changeProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: currentUserId, // Твой ID из контекста/стейта
              name: profile.name,
              phone: profile.phone,
              username: profile.username,
              status: profile.status
            }),
          });

          if (response.ok) {
            console.log("Profile updated successfully!");
          } else {
            const errorData = await response.json();
            console.error("Ошибка API:", errorData);
            throw new Error("Failed");
          }
        } catch (error) {
          console.error(error);
          alert("Ошибка при сохранении");
        } finally {
          setSending(false);
        }
      };
    
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

      if (editingMessage) {
        try {
          const res = await fetch("/api/editMessage", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message_id: editingMessage.id,
              content: message,
              currentUserId: currentUserId,
              chat_id: selectedChatId,
            }),
          });

          if(res.ok) {
            setEditingMessage(null);
            setMessage('');

            setUsernames(prev => prev.map(chat => {
              if (chat.chat_id === selectedChatId) {
                const isLast = messages[messages.length - 1]?.id === editingMessage.id;

                if (isLast) {
                  return {
                    ...chat,
                    last_message_text: message,
                  };
                }
              }
              return chat;
            }));
          } else {
            throw new Error("Failed to edit message");
          }

        } catch (error) {
          console.error("Error editing message:", error);
        }
      } else {


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
            reply_to_id: replyingToMessage ? replyingToMessage.id : null,
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
            reply_to_id: rawMessage.reply_to_id,
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
    setReplyingToMessage(null); // Сбрасываем состояние ответа
  } catch (err) {
    console.error("Ошибка отправки:", err);
  } finally {
    setSending(false);
  }
}}

async function deleteMessage( messageId: string) {
  try {
    const res = await fetch("/api/deleteMessage", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: messageId,
        currentUserId: currentUserId,
        chat_id: selectedChatId,
      }),
    });

    if (!res.ok) throw new Error("Failed to delete");

    setUsernames(prev => prev.map(chat => {
      if (chat.chat_id === selectedChatId) {

        const remainingMessages = messages.filter(m => m.id !== messageId);
        const lastMessage = remainingMessages[remainingMessages.length - 1];
        return {
          ...chat,
          last_message_text: lastMessage ? lastMessage.content : "Нет сообщений",
          last_message_at: lastMessage ? lastMessage.created_at : null,
      };
    }
    return chat; 
   }
  ));

  } catch (error) {
    console.error("Error deleting message:", error);
  }
}

    const currentChat = usernames.find(u => u.chat_id === selectedChatId);
    const currentChatInfo = {
      username: currentChat?.username || 'Выберите чат',
      user_id: currentChat?.user_id || 'Не выбран чат',
    }
    return (<>
    <div className="flex h-screen bg-white overflow-hidden">
            {/* Левый сайдбар (Иконки) */}
            {/* Синяя панель */}
      <div className="flex w-16 flex-shrink-0 bg-blue-600 flex-col items-center py-6 space-y-8 text-white z-20">
        
        {/* Иконка сообщений */}
        <div className="bg-white/20 p-2 rounded-xl cursor-pointer hover:bg-white/30 transition-all">
          <MessageSquare size={24} />
        </div>

        {/* Иконка профиля */}
        <div className="text-white/60 hover:text-white cursor-pointer transition-all">
          <User size={24} />
        </div>

        {/* Настройки */}
        <button 
          className="text-white/60 hover:text-white cursor-pointer transition-all" 
          onClick={() => setIsOpen(true)}
        >
          <Settings size={24} />
        </button>

        {/* Кнопка создания группы (та самая, что вылезла) */}
        <button 
          onClick={() => setIsGroupModalOpen(true)}
          className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer group relative flex items-center justify-center"
        >
          <UserPlus size={24} />
          {/* Подсказку скрываем на мобилках через hidden md:block */}
          <span className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
            Создать группу
          </span>
        </button>

        {/* Колокольчик вниз */}
        <div className="mt-auto pb-4 text-white/60 hover:text-white cursor-pointer transition-all">
          <Bell size={24} />
        </div>
      </div>

      {/* Список чатов (как в Telegram) */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} w-[calc(100vw-4rem)] md:w-80 flex-shrink-0 border-r border-gray-200 flex flex-col`}>
        <SearchSidebar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currentUserId={currentUserId} 
          onChatCreated={refreshChatList}
        />
        <div className="flex-1 overflow-y-auto bg-white border-r border-gray-100">
          {usernames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Чатов пока нет</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[180px]">
                Найдите собеседника по поиску или подождите первого сообщения
              </p>
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
                <div className='relative flex-shrink-0'>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm ${chat.type === 'group' ? 'bg-gradient-to-tr from-orange-400 to-red-500' : 'bg-gradient-to-tr from-blue-400 to-blue-600'}`}>
                    {chat.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {onlineUsers.includes(chat.user_id) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm z-10"></span>
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {chat.name || 'Unknown User'}
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
      <div className={`${selectedChatId ? 'flex' : 'hidden'} md:flex flex-1 flex flex-col bg-[#f4f7f9]`}>
        {/* Header */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
          <button
          onClick={() => setSelectedChatId('')}
          className='md:hidden text-blue-500 hover:bg-blue-50 rounded-full'
        ><ChevronLeft size={24}/></button>
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
              onClick={() => {

                if (currentChat?.type !== 'group') {
                  setIsUserProfileOpen(true);
                } else {
                  // Здесь можно будет потом открыть инфо о группе, если захочешь
                  console.log("Это группа, тут профиля юзера нет");
              }
            }}
            >
              <div className="relative mr-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {currentChat?.type === 'group' ? <Users size={20} /> : (currentChat?.name?.[0]?.toUpperCase() || 'U')}
                </div>
                {currentChat?.type !== 'group' && currentChat?.user_id && onlineUsers.includes(currentChat.user_id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-gray-900">
                    {currentChat?.name || "Загрузка..."}
                  </h2>
                </div>
                {currentChat?.type === 'group' ? (
                      <p className="text-[10px] text-gray-400 font-medium">Групповой чат</p>
                    ) : (
                      typingUser ? (
                        <p className="text-[10px] text-blue-500 italic animate-pulse">{typingUser} печатает...</p>
                      ) : (
                        <p className="text-[10px] font-medium transition-colors">
                          {currentChat?.user_id && onlineUsers.includes(currentChat.user_id) 
                            ? <span className="text-green-500">в сети</span> 
                            : <span className="text-gray-400">не в сети</span>}
                        </p>
                      )
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

        {/* Сообщения */}
        <NewTypeOfChatMessage messages={messages} currentUserId={currentUserId} peerLastReadAt={currentChat?.peerLastReadAt} onDelete={deleteMessage} onEdit={startEdit} onReply={startReply} />

        {/* Блок ввода сообщения с плашками */}
        <div className="bg-white border-t border-gray-100 flex-shrink-0 w-full min-w-0">
          
          {/* Плашка ОТВЕТА */}
          {replyingToMessage && (
            <div className="flex items-center justify-between px-6 py-2 bg-gray-50 border-l-4 border-l-blue-500 w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-blue-500 uppercase">Ответ пользователю</span>
                <span className="text-xs text-gray-500 break-all">
                  {truncateText(replyingToMessage.content, 160)}
                </span>
              </div>
              <button onClick={() => setReplyingToMessage(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-4">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Плашка РЕДАКТИРОВАНИЯ */}
          {editingMessage && (
            <div className="flex items-center justify-between px-6 py-2 bg-blue-50 border-l-4 border-l-blue-500 w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Редактирование</span>
                <span className="text-xs text-gray-600 break-all">
                  {truncateText(editingMessage.content, 160)}
                </span>
              </div>
              <button 
                onClick={() => { setEditingMessage(null); setMessage(""); }} 
                className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-4"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Основная строка ввода */}
          <div className="p-4 w-full">
            <div className="flex items-center gap-4 w-full">
              <button type="button" className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0 p-1">
                <Paperclip size={22} strokeWidth={1.5} />
              </button>
              
              <form className="flex-1 flex items-center gap-4 min-w-0" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 flex items-center transition-all focus-within:border-blue-300 focus-within:bg-white shadow-sm min-w-0">
                  <input 
                    type="text"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                    placeholder="Write a message..." 
                    className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
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
    </div>

    {/* Модалки настроек и профиля */}
        {isOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center" onClick={() => setIsOpen(false)}>
            <div 
              className="w-full h-full md:h-[85vh] md:max-w-4xl bg-slate-50 md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300" 
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* ЛЕВАЯ ПАНЕЛЬ (Десктоп) */}
              <div className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-8">
                <h1 className="text-3xl font-black text-slate-800 mb-10 tracking-tight">Settings</h1>
                <nav className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold"><User size={20} /> Account</div>
                  <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all cursor-pointer"><Bell size={20} /> Notifications</div>
                  <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all cursor-pointer"><Palette size={20} /> Appearance</div>
                </nav>
                <button onClick={LogoutAction} className="flex items-center gap-3 text-red-500 font-bold p-4 hover:bg-red-50 rounded-2xl transition-all">
                  <LogOut size={20} /> Logout
                </button>
              </div>

              {/* МОБИЛЬНАЯ ШАПКА */}
              <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
                <button onClick={() => setIsOpen(false)} className="text-blue-600 font-bold text-lg active:opacity-50">Done</button>
                <h1 className="text-lg font-black text-slate-800">Settings</h1>
                <div className="w-10" /> 
              </div>

              {/* ОСНОВНОЙ КОНТЕНТ */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-xl mx-auto p-6 md:p-12 space-y-8">
                  
                  {/* СЕКЦИЯ ПРОФИЛЯ */}
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-xl shadow-blue-200">
                      <div className="w-full h-full bg-white rounded-full overflow-hidden border-4 border-white">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
                    <div className="mt-2 px-4 py-1 bg-green-100 text-green-600 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
                    </div>
                  </div>

                  {/* ГРУППА ПОЛЕЙ ВВОДА (Твоя логика InfoRow теперь здесь) */}
                  <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    <InfoInput 
                        icon={<User size={18} />} 
                        label="Full Name" 
                        value={profile.name} 
                        onChange={(val: string) => handleProfileChange('name', val)} 
                    />
                    <InfoInput 
                        icon={<Phone size={18} />} 
                        label="Phone Number" 
                        value={profile.phone} 
                        onChange={(val: string) => handleProfileChange('phone', val)} 
                    />
                    <InfoInput 
                        icon={<AtSign size={18} />} 
                        label="Username" 
                        value={profile.username} 
                        onChange={(val: string) => handleProfileChange('username', val)} 
                    />
                    <InfoInput 
                        icon={<Smile size={18} />} 
                        label="Current Status" 
                        value={profile.status} 
                        onChange={(val: string) => handleProfileChange('status', val)} 
                    />
                  </div>

                  {/* КНОПКА СОХРАНЕНИЯ */}
                  <button 
                    onClick={saveProfileChanges}
                    disabled={sending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-blue-200 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    {sending ? <span className="animate-pulse">Saving...</span> : <><Save size={22} /> Save Changes</>}
                  </button>

                  {/* МОБИЛЬНЫЙ ВЫХОД */}
                  <button 
                    onClick={LogoutAction}
                    className="md:hidden w-full py-5 text-red-500 font-black flex items-center justify-center gap-2 active:bg-red-50 rounded-[24px] transition-colors"
                  >
                    <LogOut size={20} /> Logout Account
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        )}
    {isUserProfileOpen && currentChat && currentChat.type !== 'group' && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => {
        setIsUserProfileOpen(false)
        }}>
        <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <button onClick={() => setIsUserProfileOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"><Settings size={18} /></button>
          </div>
          <div className="px-8 pb-8 -mt-12 flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-3xl p-1 shadow-xl">
                <div className="w-full h-full bg-blue-100 rounded-[22px] flex items-center justify-center text-blue-600 text-3xl font-bold">{currentChat.name[0].toUpperCase()}</div>
              </div>
              {onlineUsers.includes(currentChat.user_id) && <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-gray-900">{currentChat.name}</h2>
              <p className="text-sm font-medium text-gray-400 mt-1">{onlineUsers.includes(currentChat.user_id) ? 'В сети' : 'Был(а) недавно'}</p>
            </div>
            <div className="w-full mt-8 space-y-3">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><User size={18} /></div>
                <div><p className="text-[10px] uppercase text-gray-400 font-bold">Full Name</p><p className="text-sm font-semibold text-gray-800">{currentChat.name || "Not specified"}</p></div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="p-2 bg-green-100 text-green-600 rounded-xl"><Phone size={18} /></div>
                <div><p className="text-[10px] uppercase text-gray-400 font-bold">Phone Number</p><p className="text-sm font-semibold text-gray-800">{currentChat.phone || "Hidden"}</p></div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><MessageSquare size={18} /></div>
                <div><p className="text-[10px] uppercase text-gray-400 font-bold">Username</p><p className="text-sm font-semibold text-gray-800">{currentChat.username || "Not specified"}</p></div>
              </div>
            </div>
            <button onClick={() => setIsUserProfileOpen(false)} className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">Написать сообщение</button>
          </div>
        </div>
      </div>
    )}
    {isGroupModalOpen && (
  <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsGroupModalOpen(false)}>
    <div 
      className="
        w-full max-w-md bg-white 
        rounded-[32px] shadow-2xl 
        flex flex-col 
        animate-in fade-in zoom-in-95 duration-300
        /* ЖЕСТКАЯ ВЫСОТА ТУТ */
        h-[700px] 
        max-h-[90vh]
      " 
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* Хендл сверху */}
      <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 shrink-0" />

      {/* ШАПКА */}
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Создать группу</h2>
        <button onClick={() => setIsGroupModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* КОНТЕНТ */}
      <div className="flex-1 flex flex-col overflow-hidden px-8 space-y-6">
        
        {/* ИНПУТ НАЗВАНИЯ */}
        <div className="shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Название</p>
          <input 
            type="text" 
            placeholder="Как назовем?" 
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* СПИСОК УЧАСТНИКОВ */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 shrink-0">Участники</p>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {usernames
              .filter((user, index, self) => 
                index === self.findIndex((t) => t.user_id === user.user_id)
              )
              .map(user => (
                <label key={user.user_id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer group transition-all">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-blue-600 checked:border-blue-600 outline-none transition-all"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, user.user_id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                      }}
                    />
                    <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                  </div>

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shrink-0 shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-full h-full" />
                  </div>

                  <span className="text-base font-bold text-slate-700 truncate flex-1 group-hover:text-blue-600 transition-colors">{user.name}</span>
                </label>
              ))
            }
            {/* Если участников вообще нет, покажем заглушку, чтобы не было пустоты */}
            {usernames.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <UserPlus size={40} strokeWidth={1} />
                <p className="text-sm font-medium mt-2">Нет доступных контактов</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* КНОПКА СОЗДАНИЯ */}
      <div className="p-8 pt-4 shrink-0">
        <button 
          onClick={createGroup} 
          disabled={!groupName || selectedUsers.length === 0}
          className="w-full bg-blue-600 text-white font-black py-5 rounded-[22px] shadow-xl shadow-blue-100 active:scale-[0.97] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          Создать группу
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

function InfoInput({ icon, label, value, onChange }: { icon: any, label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 group">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <input 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-800 font-bold text-base placeholder:text-slate-200 appearance-none outline-none focus:outline-none focus:ring-0 focus:border-none"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
}