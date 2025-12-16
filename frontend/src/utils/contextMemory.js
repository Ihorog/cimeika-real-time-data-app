// Контекст резонансу та історії
export function buildContext(messages) {
  const lastMessages = messages.slice(-5);
  const tone = detectTone(lastMessages[lastMessages.length - 1]?.text || "");
  const resonance = Math.random() * 0.2 + 0.7; // псевдо-рівень 0.7–0.9
  return { lastMessages, tone, resonance };
}

export function detectTone(text) {
  if (!text) return "neutral";
  const lower = text.toLowerCase();
  if (lower.includes("дякую") || lower.includes("клас")) return "positive";
  if (lower.includes("помилка") || lower.includes("погано")) return "negative";
  return "neutral";
}
