const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchMessage(): Promise<string> {
  const res = await fetch(`${API_URL}/api/message`);
  if (!res.ok) {
    throw new Error(`Erreur API : ${res.status}`);
  }
  const data = await res.json();
  return data.message;
}
