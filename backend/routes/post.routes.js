import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", getAllPosts);

// authorization
router.use(protectRoute);
router.post("/create", createPost);
router.get("/likes/:id", getLikedPosts);
router.get("/following", getFollowingPosts);
router.get("/user/:username", getUserPosts);
router.post("/like/:id", likePost);
router.post("/comment/:id", commentOnPost);
router.delete("/:id", deletePost);

export default router;
