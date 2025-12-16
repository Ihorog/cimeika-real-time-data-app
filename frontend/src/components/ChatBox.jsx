"use client";
import MessageBubble from "./MessageBubble";

export default function ChatBox({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900">
      {messages.map((message, index) => (
        <MessageBubble key={`${message.sender}-${index}`} sender={message.sender} text={message.text} />
      ))}
    </div>
  );
}
