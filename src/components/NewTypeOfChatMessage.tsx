import { Check, Pencil, Trash2, Reply } from "lucide-react";
import React from "react";

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
                        {/* Разделитель дат */}
                        {showDateSeparator && (
                            <div className="flex justify-center my-6">
                            <div className="bg-gray-200/50 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                                {formatDateSeparator(currentDateObj)}
                            </div>
                            </div>
                        )}

                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`
                                /* Ограничиваем ширину самого пузырька */
                                max-w-[75%] md:max-w-[60%]
                                p-3 shadow-sm text-sm relative group transition-all
                                
                                break-all           /* Разрывает строку В ЛЮБОМ месте */

                                p-3 shadow-sm text-sm relative group transition-all
                                
                                ${isMe 
                                    ? "bg-blue-500 text-white rounded-2xl rounded-tr-none" 
                                    : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                                }`}>

                                {showName && (
                                    <div className="text-[12px] font-bold mb-1 text-blue-600">
                                        {m.sender_name || "Пользователь"}
                                    </div>
                                )}

                            {/* 1. БЛОК ЦИТАТЫ */}
                            {repliedMessage && (
                                <div className={`mb-2 p-2 border-l-2 rounded-r-lg text-[11px] block cursor-default
                                    ${isMe 
                                        ? "border-white/70 bg-white/10 text-white"  // Стили для ТВОЕГО (синего) сообщения
                                        : "border-blue-300 bg-black/5 text-gray-800" // Стили для ЧУЖОГО (белого) сообщения
                                    }`}>
                                    <p className={`font-bold truncate ${isMe ? "text-white" : "text-blue-400"}`}>
                                        {repliedMessage.sender_username || "Пользователь"}
                                    </p>
                                    <p className={`truncate opacity-80 ${isMe ? "text-white" : "text-inherit"}`}>
                                        {repliedMessage.content}
                                    </p>
                                </div>
                            )}

                            {/* 2. ПЛАВАЮЩИЕ КНОПКИ (Появляются при наведении) */}
                            <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20
                                ${isMe ? "right-full mr-2" : "left-full ml-2"}`}>
                                
                                {/* Кнопка "Ответить" - доступна для ВСЕХ сообщений */}
                                <button 
                                    type="button"
                                    onClick={() => onReply(m)}
                                    className="p-1.5 text-gray-400 hover:text-green-500 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-90"
                                    title="Ответить"
                                >
                                    <Reply size={14} />
                                </button>

                                {/* Кнопки автора - только для СВОИХ сообщений */}
                                {isMe && (
                                    <>
                                        <button 
                                            type="button"
                                            onClick={() => onEdit(m)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-90"
                                            title="Редактировать"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => onDelete(m.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all active:scale-90"
                                            title="Удалить"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* 3. КОНТЕНТ СООБЩЕНИЯ */}
                            <div className="whitespace-pre-wrap leading-relaxed overflow-hidden">
                                {m.content}
                            </div>
                            
                            {/* 4. ВРЕМЯ И СТАТУС */}
                            <div className="flex items-center justify-end gap-1 mt-1">
                                {m.is_edited && (
                                        <span title="Отредактировано" className="opacity-80 transition-opacity mr-0.5">
                                        <Pencil size={10} strokeWidth={2.5} />
                                        </span>
                                    )}

                                    <span className="text-[10px] opacity-70">
                                        {timeStr}
                                    </span>

                                {isMe && (
                                    <div className="flex items-center">
                                        {isRead ? (
                                            <div className="flex items-center text-blue-200">
                                                <Check size={12} strokeWidth={3} />
                                                <Check size={12} strokeWidth={3} className="-ml-1.5" />
                                            </div>
                                        ) : (
                                            <Check size={12} strokeWidth={3} className="opacity-70" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </React.Fragment>
                );
            })}
        </div>
    ); 
}