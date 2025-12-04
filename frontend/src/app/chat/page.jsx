"use client";
import { useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox";
import ChatInput from "../../components/ChatInput";
import { sendChatMessage } from "../../utils/chatClient";
import { loadChat, saveChat } from "../../utils/chatHistory";
import { buildContext } from "../../utils/contextMemory";
import ResonanceMeter from "../../components/ResonanceMeter";
import { sendContext } from "../../utils/insightClient";

const INITIAL_MESSAGE = {
  sender: "ci",
  text: "Привіт 👋 Я Ci. Чим можу допомогти?",
};

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isTyping, setTyping] = useState(false);
  const [resonance, setResonance] = useState(0.8);

  useEffect(() => {
    const history = loadChat();
    if (history.length) {
      setMessages(history);
      const context = buildContext(history);
      setResonance(context.resonance);
    }
  }, []);

  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  const handleSend = async (msg) => {
    const trimmed = msg.trim();
    if (!trimmed) return;

    const nextMessages = [...messages, { sender: "user", text: trimmed }];
    setMessages(nextMessages);
    const context = buildContext(nextMessages);
    setResonance(context.resonance);
    sendContext(context);
    setTyping(true);

    try {
      const response = await sendChatMessage(trimmed);
      const responseMessages = [...nextMessages, { sender: "ci", text: response }];
      setMessages(responseMessages);
      const responseContext = buildContext(responseMessages);
      setResonance(responseContext.resonance);
    } catch (error) {
      const errorMessages = [
        ...nextMessages,
        { sender: "ci", text: "⚠️ Помилка з'єднання з сервером." },
      ];
      setMessages(errorMessages);
      const errorContext = buildContext(errorMessages);
      setResonance(errorContext.resonance);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-slate-900 rounded-2xl shadow-lg overflow-hidden">
      <ChatBox messages={messages} />
      <div className="p-2 border-t border-slate-800">
        <ResonanceMeter resonance={resonance} />
      </div>
      {isTyping && (
        <div className="p-2 text-slate-400 text-sm text-center">Ci друкує...</div>
      )}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
