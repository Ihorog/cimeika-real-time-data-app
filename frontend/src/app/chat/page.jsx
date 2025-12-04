"use client";
import { useState } from "react";
import ChatBox from "../../components/ChatBox";
import ChatInput from "../../components/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "ci", text: "Привіт! Я Ci — сенсовий координатор Cimeika 🌐" },
  ]);

  const handleSend = (message) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ci", text: "Я почув тебе. Розкажи більше 💡" },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
      <ChatBox messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
