import express from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// authenticate
router.use(protectRoute);

router.get("/me", getMe);

export default router;
