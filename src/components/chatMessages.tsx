type ChatMessage = {
  sender_id: string;
  content: string;
  created_at: Date
};

type ChatMessagesProps = {
  messages: ChatMessage[];
};

export default function ChatMessages ({ messages }: ChatMessagesProps) {
    return(
        <>
            <div className="ml-[10px]">
            {messages.map((m, i) => {
                const date = new Date(m.created_at); // <-- конвертация
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                <p className='rounded-lg pt-[5px] pl-[8px] text-[14px] bg-[#252829] max-w-[330px] mb-[10px]' key={i}>
                    <strong className="text-[10px]">{m.sender_id}</strong>: {m.content}
                    <p className="flex justify-end text-[9px] pr-[5px]">{timeStr}</p>
                </p>
            )})}
        </div>
        </>
    ); 
}