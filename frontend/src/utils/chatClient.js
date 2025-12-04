export async function sendChatMessage(message) {
  const res = await fetch("http://localhost:3000/api/v1/ci/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  return data.response || "⚠️ Немає відповіді від Ci.";
}
