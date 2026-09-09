import { useEffect, useState } from "react";
import { fetchMessage } from "./api";

export default function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessage()
      .then(setMessage)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!message) return <p>Chargement…</p>;
  return <h1>{message}</h1>;
}
