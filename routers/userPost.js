import { Router } from "express";
import { handlePostText } from "../controllers/userPost.js";

const router = Router();

router.post("/post-text", handlePostText);

export { router };
