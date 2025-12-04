"use client";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = setInterval(() => {
      fetch("http://localhost:3000/api/v1/health")
        .then((response) => setOnline(response.ok))
        .catch(() => setOnline(false));
    }, 5000);

    return () => clearInterval(check);
  }, []);

  return (
    <div className="fixed bottom-2 right-2 text-xs text-slate-400">
      {online ? "🟢 Онлайн" : "🔴 Офлайн"}
    </div>
  );
}
