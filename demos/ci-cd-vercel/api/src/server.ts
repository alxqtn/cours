import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/message", (_req, res) => {
  res.json({ message: "Bonjour depuis l'API !" });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello from the API!" });
})

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
