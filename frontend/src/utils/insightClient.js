export async function sendContext(context) {
  try {
    await fetch("http://localhost:3000/api/v1/insight/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });
  } catch (e) {
    console.warn("Insight backend недоступний:", e);
  }
}
