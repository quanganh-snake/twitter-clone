import express from "express";

// Router importants
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import postRouter from "./post.route.js";
import notificationRouter from "./notification.route.js";

// define
const router = express.Router();

router.use("/api/auth", authRouter);
router.use("/api/users", userRouter);
router.use("/api/post", postRouter);
router.use("/api/notifications", notificationRouter);
export default router;
