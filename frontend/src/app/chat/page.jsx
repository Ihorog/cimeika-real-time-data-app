"use client";
import { useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox";
import ChatInput from "../../components/ChatInput";
import { sendChatMessage } from "../../utils/chatClient";
import { loadChat, saveChat } from "../../utils/chatHistory";

const INITIAL_MESSAGE = {
  sender: "ci",
  text: "Привіт 👋 Я Ci. Чим можу допомогти?",
};

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isTyping, setTyping] = useState(false);

  useEffect(() => {
    const history = loadChat();
    if (history.length) {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  const handleSend = async (msg) => {
    const trimmed = msg.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setTyping(true);

    try {
      const response = await sendChatMessage(trimmed);
      setMessages((prev) => [...prev, { sender: "ci", text: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ci", text: "⚠️ Помилка з'єднання з сервером." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
      <ChatBox messages={messages} />
      {isTyping && (
        <div className="p-2 text-slate-400 text-sm text-center">Ci друкує...</div>
      )}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
