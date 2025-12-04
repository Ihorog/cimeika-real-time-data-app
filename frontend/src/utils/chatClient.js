export async function sendChatMessage(message) {
  const response = await fetch("http://localhost:3000/api/v1/ci/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const data = await response
    .json()
    .catch(() => ({ response: "⚠️ Немає відповіді від Ci." }));

  return data?.response ?? "⚠️ Немає відповіді від Ci.";
}
