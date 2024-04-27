import express from "express";

// Router importants
import authRouter from "./auth.routes.js";

// define
const router = express.Router();

router.use("/api/auth", authRouter);
export default router;
