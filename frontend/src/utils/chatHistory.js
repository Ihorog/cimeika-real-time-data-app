export function saveChat(messages) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ci_chat_history", JSON.stringify(messages));
}

export function loadChat() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("ci_chat_history");
  return data ? JSON.parse(data) : [];
}
