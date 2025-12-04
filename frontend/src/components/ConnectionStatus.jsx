"use client";
import { useEffect, useState } from "react";

export default function ConnectionStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkStatus = () => {
      fetch("http://localhost:3000/api/v1/health")
        .then((response) => {
          if (!cancelled) {
            setOnline(response.ok);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setOnline(false);
          }
        });
    };

    checkStatus();
    const check = setInterval(checkStatus, 5000);

    return () => {
      cancelled = true;
      clearInterval(check);
    };
  }, []);

  return (
    <div className="fixed bottom-2 right-2 text-xs text-slate-400">
      {online ? "🟢 Онлайн" : "🔴 Офлайн"}
    </div>
  );
}
