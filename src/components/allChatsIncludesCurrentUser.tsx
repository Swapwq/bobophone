'use client';
import { useState, useEffect } from "react";
import ChatMessages from "./chatMessages";
import Image from "next/image";

type ChatUser = {
  user_id: string;
  chat_id: string;
  username: string;
};

type ChatMessage = {
  sender_id: string;
  content: string;
  created_at: Date;
};

type MessageWithSender = {
  id: string;
  sender_id: string;
  sender_username: string | null;
  content: string | null;
  created_at: Date;
};


export default function AllChatsIncludesCurrentUser({ currentUserId }: { currentUserId: string }) {
  const [usernames, setUsernames] = useState<{ user_id: string; chat_id: string; username: string }[]>([]);
   const [loadingMessages, setLoadingMessages] = useState(false);
   const [messages, setMessages] = useState<{ sender_id: string; content: string; created_at: Date; sender_username: string }[]>([]);
   const [message, setMessage] = useState("");
   const [sending, setSending] = useState(false);
   const [selectedChatId, setSelectedChatId] = useState('');

  useEffect(() => {
    async function loadChats() {
      const res = await fetch(`/api/chats?currentUserId=${currentUserId}`);
      const data: ChatUser[] = await res.json();
      setUsernames(data);
    }
    loadChats();
  }, [currentUserId]);

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

  async function sendMessage() {
    if (!message.trim()) return;

    setSending(true);

    try{
        const res = await fetch("/api/sendMessage", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: selectedChatId,
                sender_id: currentUserId,
                content: message,
            })
        })

        const rawMessage: {
            sender_id: string;
            content: string;
            created_at: string;
            sender_username: string;
        } = await res.json();


        setMessages(prev => [
            ...prev,
            {
                sender_id: rawMessage.sender_id,
                content: rawMessage.content,
                created_at: new Date(rawMessage.created_at),
                sender_username: rawMessage.sender_username,
            },
        ]);

        setMessage('');
    } finally {
        setSending(false);
    }
  }

  if (!usernames.length) return <p>Loading chats...</p>;
  const currentChatUsername = usernames.find(u => u.chat_id === selectedChatId)?.username;

  return (
    <>
        <div className="flex justify-start">
            <div className="h-screen border-r-2 border-[#4D4D4D]">
                <ul>
                    {usernames.map((u, i) => <button key={u.chat_id} className="flex items-center bg-[#303030] w-[300px] h-[45px] pl-[15px] hover:bg-[#3D3D3D] transition duration-200 cursor-pointer" onClick={() => {setSelectedChatId(u.chat_id); loadMessages(u.chat_id)}} disabled={loadingMessages}>{u.username}</button>)}
                </ul>
            </div>

            <div className="h-screen flex-1">
                <div className="fixed flex items-center top-0 left-[300px] h-[40px] right-0 px-4 text-[15px] border-b-2 border-[#4D4D4D] bg-[#212121]">
                  <p>{currentChatUsername}</p>
                </div>
                <ChatMessages messages={messages}/>
            </div>
            <div className="fixed bottom-2 left-[300px] right-0 px-4">
                <form className='flex items-center gap-2 bg-[#2E2E2E] rounded-full px-3 py-2' onSubmit={e => { e.preventDefault(); sendMessage(); }}>
                    <input className='flex-1 bg-transparent outline-none text-white placeholder-gray-400' placeholder="Введите текст..." type="text" value={message} onChange={e => setMessage(e.target.value)}></input>
                    <button className="flex justify-center items-center absolute right-7 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full cursor-pointer hover:bg-[#292929] hover:scale-140 transition duration-300" type="submit" onClick={sendMessage} disabled={sending}><svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        strokeWidth={0}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg></button>
                </form>
            </div>
        </div>
    </>
  );
}
