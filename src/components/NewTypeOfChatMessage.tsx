type ChatMessage = {
  sender_id: string;
  content: string;
  created_at: Date;
  sender_username: string;
};

type ChatMessagesProps = {
  messages: ChatMessage[];
  currentUserId: string;
};

export default function ChatMessages ({ messages, currentUserId }: ChatMessagesProps) {
    return (
        /* Контейнер для ВСЕХ сообщений — отступы и скролл только тут */
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full bg-[#f4f7f9]">
            {messages.map((m, i) => {
                const date = new Date(m.created_at);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const isMe = m.sender_id === currentUserId;

                return (
                    /* Контейнер конкретной строки сообщения */
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3 shadow-sm text-sm relative
                            ${isMe 
                                ? "bg-blue-500 text-white rounded-2xl rounded-tr-none" 
                                : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                            }`}
                        >
                            {m.content}
                            {/* Можно еще время добавить в уголок */}
                            <div className={`text-[10px] mt-1 opacity-60 text-right`}>
                                {timeStr}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    ); 
}