type ChatMessage = {
  sender_id: string;
  content: string;
  created_at: Date;
  sender_username: string;
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
                <p className='rounded-lg pt-[5px] pl-[8px] bg-[#252829] max-w-[330px] mb-[5px]' key={i}>
                    <strong className="text-[13px]">{m.sender_username}</strong>
                    <span className="text-[14px] mr-[6px]">: {m.content}</span>
                    <p className="flex justify-end text-[8px] pr-[3px]">{timeStr}</p>
                </p>
            )})}
        </div>
        </>
    ); 
}