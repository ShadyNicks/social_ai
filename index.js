import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import { handleGenerateLLMResponse } from "./controllers/llmGenerate.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const groq = new Groq();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));
app.get("/generate", handleGenerateLLMResponse);

app.listen(PORT, () =>
  console.log(`Server running at: http://localhost:${PORT}`)
);

export { groq };
export default app;
