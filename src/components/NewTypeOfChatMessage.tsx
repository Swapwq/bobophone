import { Check, Pencil, Trash2, Reply } from "lucide-react";
import React, { useState } from "react";

type ChatMessage = {
    id: string;
    sender_id: string;
    content: string;
    created_at: Date;
    sender_username: string;
    sender_name?: string | null;
    is_edited: boolean;
    reply_to_id: string | null; 
    replies: string
};

type ChatMessagesProps = {
    messages: ChatMessage[];
    currentUserId: string;
    peerLastReadAt?: string | Date | null;
    onDelete: (id: string) => void;
    onEdit: (message: any) => void;
    onReply: (message: any) => void;
};

export default function ChatMessages({ messages, currentUserId, peerLastReadAt, onDelete, onEdit, onReply }: ChatMessagesProps) {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    
    const formatDateSeparator = (date: Date) => { // Меняем string на Date
        const now = new Date();
        
        
        if (date.toDateString() === now.toDateString()) {
            return "Сегодня";
        }
        
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Вчера";
        }

        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long' 
        });
        };

    return (
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full bg-[#f4f7f9]">
            {messages.map((m, index) => {
                const currentDateObj = new Date(m.created_at);
                const currentDate = currentDateObj.toDateString();
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const prevDate = index > 0 
                    ? new Date(messages[index - 1].created_at).toDateString() 
                    : null;
                const showDateSeparator = currentDate !== prevDate;
                const timeStr = currentDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                
                // Поиск сообщения, на которое ответили
                const isActiveMenu = activeMenuId === m.id; // Проверка, открыто ли ме
                const repliedMessage = m.reply_to_id ? messages.find(msg => msg.id === m.reply_to_id) : null;
                const isMe = m.sender_id === currentUserId;
                const isRead = peerLastReadAt && new Date(m.created_at) <= new Date(peerLastReadAt);
                const showName = !isMe && (
                    index === 0 || 
                    showDateSeparator || 
                    prevMsg?.sender_id !== m.sender_id
                );

                return (
                    <React.Fragment key={m.id}>
                        {showDateSeparator && (
                            <div className="flex justify-center my-6">
                                <div className="bg-gray-200/50 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {formatDateSeparator(currentDateObj)}
                                </div>
                            </div>
                        )}

                        {/* Главный контейнер сообщения */}
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            
                            <div 
                                onClick={() => setActiveMenuId(isActiveMenu ? null : m.id)} // ТЫК для мобилки
                                className={`
                                    max-w-[75%] md:max-w-[60%] p-3 shadow-sm text-sm relative group transition-all cursor-pointer
                                    ${isMe 
                                        ? "bg-blue-500 text-white rounded-2xl rounded-tr-none" 
                                        : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                                    }
                                `}
                            >
                                {/* Имя отправителя */}
                                {showName && (
                                    <div className="text-[12px] font-bold mb-1 text-blue-600">
                                        {m.sender_name || "Пользователь"}
                                    </div>
                                )}

                                {/* Цитата ответа */}
                                {repliedMessage && (
                                    <div className={`mb-2 p-2 border-l-2 rounded-r-lg text-[11px] ${isMe ? "border-white/70 bg-white/10" : "border-blue-300 bg-black/5"}`}>
                                        <p className="font-bold truncate">{repliedMessage.sender_username}</p>
                                        <p className="opacity-80 line-clamp-2">{repliedMessage.content}</p>
                                    </div>
                                )}

                                {/* --- КНОПКИ ДЛЯ ПК (md:flex) --- */}
                                <div className={`absolute top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20
                                    ${isMe ? "right-full mr-2" : "left-full ml-2"}`}>
                                    <button onClick={(e) => { e.stopPropagation(); onReply(m); }} className="p-1.5 bg-white border rounded-full text-gray-400 hover:text-blue-500"><Reply size={14}/></button>
                                    {isMe && (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); onEdit(m); }} className="p-1.5 bg-white border rounded-full text-gray-400 hover:text-green-500"><Pencil size={14}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(m.id); }} className="p-1.5 bg-white border rounded-full text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                        </>
                                    )}
                                </div>

                                {/* Контент сообщения */}
                                <div className="whitespace-pre-wrap leading-relaxed break-words">
                                    {m.content}
                                </div>
                                
                                {/* Время и статус */}
                                <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[10px]">
                                    {m.is_edited && <Pencil size={10} />}
                                    <span>{timeStr}</span>
                                    {isMe && (isRead ? <div className="flex text-blue-200"><Check size={12}/><Check size={12} className="-ml-1.5"/></div> : <Check size={12}/>)}
                                </div>
                            </div>

                            {/* --- МОБИЛЬНОЕ МЕНЮ (Показывается под пузырьком при клике) --- */}
                            {isActiveMenu && (
                                <div className="flex md:hidden items-center gap-6 mt-2 mb-4 px-4 py-2 bg-white shadow-lg rounded-full border border-gray-100 animate-in fade-in slide-in-from-top-1">
                                    <button onClick={() => { onReply(m); setActiveMenuId(null); }} className="text-blue-500 flex flex-col items-center gap-0.5">
                                        <Reply size={20} />
                                        <span className="text-[9px]">Ответ</span>
                                    </button>
                                    {isMe && (
                                        <>
                                            <button onClick={() => { onEdit(m); setActiveMenuId(null); }} className="text-green-500 flex flex-col items-center gap-0.5">
                                                <Pencil size={20} />
                                                <span className="text-[9px]">Изм.</span>
                                            </button>
                                            <button onClick={() => { onDelete(m.id); setActiveMenuId(null); }} className="text-red-500 flex flex-col items-center gap-0.5">
                                                <Trash2 size={20} />
                                                <span className="text-[9px]">Удалить</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}

        </div>
    ); 
}