import express from "express";
import { protectRoute } from "./../middlewares/protectRoute.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controller.js";
const router = express.Router();

router.use(protectRoute);
router.get("/", getNotifications);
router.delete("/", deleteNotifications);
router.delete("/:id", deleteNotification);

export default router;
