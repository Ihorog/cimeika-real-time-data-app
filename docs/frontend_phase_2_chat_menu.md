# 💬 CIMEIKA FRONTEND — PHASE 2: MAIN CHAT PAGE & NAVIGATION

## 🎯 Ціль
Створити **головну сторінку чату** системи Cimeika з базовим **навігаційним меню** та структурою для майбутнього інтерактивного спілкування користувача з Ci (штучним інтелектом системи).

## 🧩 1. Структура проєкту
```
frontend/
├─ src/
│   ├─ app/
│   │   ├─ layout.jsx             # Головний каркас сторінки
│   │   ├─ page.jsx               # Головна панель (SystemStatus)
│   │   ├─ chat/
│   │   │   └─ page.jsx           # Сторінка чату
│   │   └─ modules/
│   │       ├─ ci.jsx
│   │       ├─ insight.jsx
│   │       └─ system.jsx
│   ├─ components/
│   │   ├─ Navbar.jsx             # Меню навігації
│   │   ├─ ChatBox.jsx            # Вікно чату
│   │   ├─ ChatInput.jsx          # Поле введення
│   │   └─ MessageBubble.jsx      # Повідомлення
│   └─ utils/
│       └─ apiClient.js
└─ public/
└─ logo.svg
```

## 🧱 2. Компонент меню — Navbar
```jsx
// src/components/Navbar.jsx
"use client";
import Link from "next/link";

export default function Navbar() {
  const menu = [
    { name: "Головна", href: "/" },
    { name: "Чат", href: "/chat" },
    { name: "Ci", href: "/modules/ci" },
    { name: "Insight", href: "/modules/insight" },
    { name: "Система", href: "/modules/system" },
  ];

  return (
    <nav className="w-full bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-cyan-400">Cimeika</span>
      </div>
      <ul className="flex gap-5">
        {menu.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-cyan-400 transition-colors">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## 🧠 3. Макет сторінки — layout.jsx
```jsx
// src/app/layout.jsx
import "../globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Cimeika Interface",
  description: "Cimeika AI System Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className="bg-slate-800 text-white">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
```

## 💬 4. Сторінка чату — Chat Page
```jsx
// src/app/chat/page.jsx
"use client";
import ChatBox from "../../components/ChatBox";
import ChatInput from "../../components/ChatInput";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { sender: "ci", text: "Привіт! Я Ci — сенсовий координатор Cimeika 🌐" },
  ]);

  const handleSend = (msg) => {
    if (!msg.trim()) return;
    setMessages([...messages, { sender: "user", text: msg }]);
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
```

## 🧾 5. Компоненти чату
### 🧊 ChatBox.jsx
```jsx
// src/components/ChatBox.jsx
"use client";
import MessageBubble from "./MessageBubble";

export default function ChatBox({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((m, i) => (
        <MessageBubble key={i} sender={m.sender} text={m.text} />
      ))}
    </div>
  );
}
```

### 💬 MessageBubble.jsx
```jsx
// src/components/MessageBubble.jsx
export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`px-4 py-2 rounded-xl max-w-[75%] ${
          isUser ? "bg-cyan-600 text-white" : "bg-slate-700 text-gray-100"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
```

### 🖊️ ChatInput.jsx
```jsx
// src/components/ChatInput.jsx
"use client";
import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
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
        onChange={(e) => setMsg(e.target.value)}
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
```

## 🚀 6. Запуск і перевірка
```bash
npm run dev
```

Після запуску:
* Перейди до `http://localhost:3000/chat`
* Перевір, що меню зверху активне, а чат працює: користувач може писати, а Ci відповідає шаблонно.

## ✅ 7. Результат
* Меню з основними розділами (`Головна`, `Чат`, `Ci`, `Insight`, `Система`);
* Робоча сторінка `/chat` з базовим чат-інтерфейсом;
* Структура компонентів готова для підключення API `/api/v1/ci/chat`.

## 🔮 Наступна фаза
**PHASE 3 — Chat API Connection**
* Підключення реального API `/api/v1/ci/chat`
* Потік повідомлень між користувачем і Ci через WebSocket / fetch
* Індикатор статусу “Ci typing...”
* Збереження історії діалогу

Цей `.md` — повний, самодостатній.
Можеш віддати його виконавцю або додати у Git як інструкцію для розробника наступного етапу:
> “Cimeika Frontend — Phase 2: Main Chat Page & Navigation”.
