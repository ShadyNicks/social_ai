import { Router } from "express";
import { handleGenerateComments } from "../controllers/llmGenerate.js";

const router = Router();

router.get("/generate-comments", handleGenerateComments);

export { router };
