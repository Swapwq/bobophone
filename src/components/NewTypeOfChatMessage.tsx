import { Check, Pencil, Trash2, Reply, Copy, Forward, Share2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    theme?: 'light' | 'dark';
};

export default function ChatMessages({ messages, currentUserId, peerLastReadAt, onDelete, onEdit, onReply, theme = 'light' }: ChatMessagesProps) {

    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Автопрокрутка вниз при изменении сообщений
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    
    const formatDateSeparator = (date: Date) => {
        const now = new Date();
        if (date.toDateString() === now.toDateString()) return "Сегодня";
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return "Вчера";
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSelectedMessage(null);
    };

    // Функция открытия меню только для мобилок
    const handleMessageClick = (m: ChatMessage) => {
        if (window.innerWidth < 768) {
            setSelectedMessage(m);
        }
    };

    const isDark = theme === 'dark';

    return (
        <div 
            ref={scrollRef}
            className={`flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full scroll-smooth relative transition-colors duration-300 ${
                theme === 'dark' ? 'bg-[#0e1621]' : 'bg-[#f4f7f9]'
            }`}
        >
            {messages.map((m, index) => {
                const currentDateObj = new Date(m.created_at);
                const prevDate = index > 0 ? new Date(messages[index - 1].created_at).toDateString() : null;
                const showDateSeparator = currentDateObj.toDateString() !== prevDate;
                const timeStr = currentDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const repliedMessage = m.reply_to_id ? messages.find(msg => msg.id === m.reply_to_id) : null;
                const isMe = m.sender_id === currentUserId;
                const isRead = peerLastReadAt && new Date(m.created_at) <= new Date(peerLastReadAt);
                const showName = !isMe && (index === 0 || showDateSeparator || messages[index - 1].sender_id !== m.sender_id);

                return (
                    <React.Fragment key={m.id}>
                        {showDateSeparator && (
                            <div className="flex justify-center my-6">
                                <div className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-200/50 text-gray-500'}`}>
                                    {formatDateSeparator(currentDateObj)}
                                </div>
                            </div>
                        )}

                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <motion.div 
                                layoutId={`msg-${m.id}`}
                                onClick={() => handleMessageClick(m)}
                                className={`
                                    max-w-[85%] md:max-w-[60%] p-3 shadow-sm text-sm relative group transition-all cursor-pointer
                                    ${isMe 
                                        ? `text-white rounded-2xl rounded-tr-none ${
                                            theme === 'dark' ? 'bg-[#2b5278] border border-white/5' : 'bg-blue-600'
                                          }` 
                                        : `${isDark ? 'bg-[#182533] text-slate-100 border border-white/5' : 'bg-white text-gray-800'} rounded-2xl rounded-tl-none`
                                    }
                                `}
                            >
                                {showName && <div className={`text-[12px] font-bold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{m.sender_name || "Пользователь"}</div>}
                                
                                {repliedMessage && (
                                    <div className={`mb-2 p-2 border-l-2 rounded-r-lg text-[11px] ${isMe ? "border-white/70 bg-white/10" : (isDark ? "border-blue-400/50 bg-white/5" : "border-blue-300 bg-black/5")}`}>
                                        <p className="font-bold truncate">{repliedMessage.sender_username}</p>
                                        <p className="opacity-80 line-clamp-2">{repliedMessage.content}</p>
                                    </div>
                                )}

                                {/* --- PREMIUM DESKTOP BUTTONS --- */}
                                <div className={`
                                    absolute top-1/2 -translate-y-1/2 hidden md:group-hover:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20 scale-90 group-hover:scale-100 duration-200
                                    py-12 
                                    ${isMe 
                                        ? "right-full pr-12 pl-20 -mr-6 -ml-20" 
                                        : "left-full pl-12 pr-20 -ml-6 -mr-20"
                                    }
                                `}>
                                    <DesktopActionButton 
                                        icon={<Reply size={14}/>} 
                                        onClick={(e: any) => { e.stopPropagation(); onReply(m); }} 
                                        hoverColor={isDark ? "hover:text-blue-400 hover:bg-white/5" : "hover:text-blue-500 hover:bg-blue-50"}
                                        isDark={isDark}
                                    />
                                    
                                    <DesktopActionButton 
                                        icon={<Copy size={14}/>} 
                                        onClick={(e: any) => { e.stopPropagation(); copyToClipboard(m.content); }} 
                                        hoverColor={isDark ? "hover:text-slate-300 hover:bg-white/5" : "hover:text-gray-600 hover:bg-gray-100"}
                                        isDark={isDark}
                                    />

                                    {isMe && (
                                        <>
                                            <DesktopActionButton 
                                                icon={<Pencil size={14}/>} 
                                                onClick={(e: any) => { e.stopPropagation(); onEdit(m); }} 
                                                hoverColor={isDark ? "hover:text-green-400 hover:bg-white/5" : "hover:text-green-500 hover:bg-green-50"}
                                                isDark={isDark}
                                            />
                                            <DesktopActionButton 
                                                icon={<Trash2 size={14}/>} 
                                                onClick={(e: any) => { e.stopPropagation(); onDelete(m.id); }} 
                                                hoverColor={isDark ? "hover:text-red-400 hover:bg-white/5" : "hover:text-red-500 hover:bg-red-50"}
                                                isDark={isDark}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="whitespace-pre-wrap leading-relaxed break-words">{m.content}</div>
                                
                                <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[10px]">
                                    {m.is_edited && <Pencil size={10} />}
                                    <span>{timeStr}</span>
                                    {isMe && (isRead ? <div className={`flex ${isDark ? 'text-blue-400' : 'text-blue-200'}`}><Check size={12}/><Check size={12} className="-ml-1.5"/></div> : <Check size={12} className={isDark ? 'text-slate-400' : 'text-white/70'}/>)}
                                </div>
                            </motion.div>
                        </div>
                    </React.Fragment>
                );
            })}

            {/* --- iOS STYLE CONTEXT MENU --- */}
            <AnimatePresence>
                {selectedMessage && (
                    <div 
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
                        onClick={() => setSelectedMessage(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        
                        <div className={`flex flex-col gap-4 max-w-xs w-full z-10 ${selectedMessage.sender_id === currentUserId ? "items-end" : "items-start"}`}>
                            <motion.div 
                                layoutId={`msg-${selectedMessage.id}`}
                                className={`
                                    p-4 shadow-2xl text-sm rounded-2xl w-fit
                                    ${selectedMessage.sender_id === currentUserId 
                                        ? `text-white rounded-tr-none ${
                                            theme === 'dark' ? 'bg-[#2b5278]' : 'bg-blue-600'
                                          }` 
                                        : `${isDark ? 'bg-[#182533] text-slate-100 border border-white/5' : 'bg-white text-gray-800'} rounded-tl-none`
                                    }
                                `}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed">{selectedMessage.content}</div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className={`rounded-[24px] shadow-2xl overflow-hidden min-w-[200px] border backdrop-blur-xl ${isDark ? 'bg-[#17212b]/90 border-white/10' : 'bg-white/90 border-white/20'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={`flex flex-col divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                    <MenuButton icon={<Reply size={18}/>} label="Ответить" onClick={() => { onReply(selectedMessage); setSelectedMessage(null); }} isDark={isDark} />
                                    <MenuButton icon={<Copy size={18}/>} label="Копировать" onClick={() => copyToClipboard(selectedMessage.content)} isDark={isDark} />
                                    {selectedMessage.sender_id === currentUserId && (
                                        <>
                                            <MenuButton icon={<Pencil size={18}/>} label="Изменить" onClick={() => { onEdit(selectedMessage); setSelectedMessage(null); }} isDark={isDark} />
                                            <MenuButton icon={<Trash2 size={18}/>} label="Удалить" color="text-red-500" onClick={() => { onDelete(selectedMessage.id); setSelectedMessage(null); }} isDark={isDark} />
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    ); 
}

function MenuButton({ icon, label, onClick, color = "text-gray-700", isDark }: { icon: any, label: string, onClick: () => void, color?: string, isDark?: boolean }) {
    return (
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex items-center justify-between px-5 py-4 w-full hover:bg-black/5 active:bg-black/10 transition-colors ${isDark ? (color === 'text-red-500' ? color : 'text-slate-300') : color}`}
        >
            <span className="font-semibold text-sm">{label}</span>
            <div className="opacity-70">{icon}</div>
        </button>
    );
}

function DesktopActionButton({ icon, onClick, hoverColor, isDark }: { icon: any, onClick: (e: any) => void, hoverColor: string, isDark?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className={`p-2 backdrop-blur-md border shadow-sm rounded-xl transition-all duration-200 flex items-center justify-center active:scale-90 ${isDark ? 'bg-[#242f3d] border-white/10 text-slate-300' : 'bg-white/80 border-white text-gray-400'} ${hoverColor}`}
        >
            {icon}
        </button>
    );
}