export default function MessageBubble({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
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
