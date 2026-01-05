'use client';

import { useState } from "react";
import SearchUser from "./searchUser";
import AllChatsIncludesCurrentUser from "./allChatsIncludesCurrentUser";

export default function ChatSidebar({ currentUserId }: { currentUserId: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex h-screen">
      <div className="">
        <SearchUser
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* 🔥 ВОТ ТУТ МАГИЯ */}
        {!isSearching && (
          <AllChatsIncludesCurrentUser currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
