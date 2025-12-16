"use client";
import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [msg, setMsg] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSend(msg);
    setMsg("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-slate-700 flex gap-2 bg-slate-800"
    >
      <input
        className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none"
        value={msg}
        onChange={(event) => setMsg(event.target.value)}
        placeholder="Напиши повідомлення..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition"
      >
        Надіслати
      </button>
    </form>
  );
}
