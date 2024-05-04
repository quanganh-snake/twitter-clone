import express from "express";

// Router importants
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import postRouter from "./post.routes.js";

// define
const router = express.Router();

router.use("/api/auth", authRouter);
router.use("/api/users", userRouter);
router.use("/api/post", postRouter);
export default router;
