'use client';

import { useState } from "react";

export default function SettingMenu({  currentUserUsername, }: {  currentUserUsername: string; }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
        <div className="fixed bottom-1 max-w-[300px] w-[280px] h-[40px] mb-[5px] mx-[10px] bg-[#2E2E2E] rounded-full flex items-center justify-between px-[6px]">
            <p className="pl-[25px] text-[15px]">{currentUserUsername}</p>
            <div className="">
                <button
            className="
                w-[30px] h-[30px]
                flex items-center justify-center
                rounded-full
                bg-[#2E2E2E]
                hover:bg-[#292929]
                transition
                duration-200
                cursor-pointer
                transform
                hover:rotate-45
            "
            onClick={() => setIsOpen(true)}
            >
            <img src='/settings-gear.png' alt="settibngs"></img>
            </button>
            </div>
        </div>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsOpen(false)}>
                <div className="bg-[#2E2E2E] rounded-lg w-[400px] max-w-full p-6 relative">
                    <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
                    onClick={() => setIsOpen(false)}
                    >
                    ✕
                    </button>
                </div>
            </div>
        )}
        </>
    )
}