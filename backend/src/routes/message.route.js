import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteChat,
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// Get sidebar users with unseen counts
router.get("/users", protectRoute, getUsersForSidebar);

// Get messages between logged in user and selected user
router.get("/:id", protectRoute, getMessages);

// Send a message
router.post("/send/:id", protectRoute, sendMessage);

// Mark a message as seen
router.patch("/:id/seen", protectRoute, markMessageAsSeen);

// Soft delete chat
router.patch("/deleteChat/:userId", protectRoute, deleteChat);

export default router;
