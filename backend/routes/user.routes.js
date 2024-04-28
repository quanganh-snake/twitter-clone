import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { followUnfollowUser, getSuggetedUsers, getUserProfile, updateUser } from "../controllers/user.cotroller.js";

const router = express.Router();

// authenticated
router.use(protectRoute);

router.get("/profile/:username", getUserProfile);
router.post("/follow/:id", followUnfollowUser);
router.get("/suggested", getSuggetedUsers);
router.post("/update", updateUser);
export default router;
