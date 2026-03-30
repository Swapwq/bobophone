import { Check } from "lucide-react"; // Не забудь импорт!

type ChatMessage = {
  sender_id: string;
  content: string;
  created_at: Date;
  sender_username: string;
};

type ChatMessagesProps = {
  messages: ChatMessage[];
  currentUserId: string;
  peerLastReadAt?: string | Date | null;
};

export default function ChatMessages({ messages, currentUserId, peerLastReadAt }: ChatMessagesProps) {
    return (
        <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto h-full bg-[#f4f7f9]">
            {messages.map((m, i) => {
                const date = new Date(m.created_at);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const isMe = m.sender_id === currentUserId;

                // ЛОГИКА ПРОЧТЕНИЯ:
                // Если есть дата прочтения собеседника и сообщение создано ДО этой даты
                const isRead = peerLastReadAt && new Date(m.created_at) <= new Date(peerLastReadAt);

                return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] p-3 shadow-sm text-sm relative
                            ${isMe 
                                ? "bg-blue-500 text-white rounded-2xl rounded-tr-none" 
                                : "bg-white text-gray-800 rounded-2xl rounded-tl-none"
                            }`}
                        >
                            {m.content}
                            
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] opacity-70">
                                    {timeStr}
                                </span>

                                {isMe && (
                                    <div className="flex items-center">
                                        {isRead ? (
                                            /* Две синие галочки */
                                            <div className="flex items-center text-blue-200">
                                                <Check size={12} strokeWidth={3} />
                                                <Check size={12} strokeWidth={3} className="-ml-1.5" />
                                            </div>
                                        ) : (
                                            /* Одна серая/белая галочка */
                                            <Check size={12} strokeWidth={3} className="opacity-70" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    ); 
}