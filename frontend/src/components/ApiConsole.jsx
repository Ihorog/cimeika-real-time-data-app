"use client";
import { useState } from "react";
import axios from "axios";

const endpoints = [
  { label: "Ci Chat", path: "/ci/chat", method: "POST" },
  { label: "Маля Creative", path: "/mala/creative", method: "POST" },
  { label: "Галерея Upload", path: "/gallery/upload", method: "POST" },
];

export default function ApiConsole({ baseUrl = "http://localhost:8000" }) {
  const [active, setActive] = useState(endpoints[0]);
  const [payload, setPayload] = useState("{\n  \"message\": \"Привіт, Ci!\"\n}");
  const [response, setResponse] = useState(null);

  const send = async () => {
    try {
      const body = JSON.parse(payload || "{}");
      const url = `${baseUrl}${active.path}`;
      const res = await axios({ url, method: active.method.toLowerCase(), data: body });
      setResponse(res.data);
    } catch (error) {
      setResponse({ error: error.message });
    }
  };

  return (
    <div className="ci-panel rounded-2xl p-4 text-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">API Console</h3>
        <span className="text-xs text-slate-400">base: {baseUrl}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {endpoints.map((ep) => (
          <button
            key={ep.path}
            onClick={() => setActive(ep)}
            className={`px-3 py-1 text-sm rounded-full border ${
              active.path === ep.path ? "border-sky-400 text-sky-200" : "border-slate-700 text-slate-300"
            }`}
          >
            {ep.label}
          </button>
        ))}
      </div>
      <textarea
        className="w-full h-32 rounded-lg bg-slate-900/60 border border-slate-800 p-3 text-sm"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={send}
          className="px-4 py-2 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 transition"
        >
          Надіслати
        </button>
      </div>
      <pre className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 text-xs overflow-auto h-40">
        {response ? JSON.stringify(response, null, 2) : "Очікування відповіді..."}
      </pre>
    </div>
  );
}
