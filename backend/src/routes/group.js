import express from "express";
import {
  createGroup,
  addMember,
  removeMember,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup
} from "../controllers/group.js";
import { protectedRoute } from "../middleware/middleware.js";

const router = express.Router();

router.post("/create", protectedRoute, createGroup);
router.post("/add-member", protectedRoute, addMember);
router.post("/remove-member", protectedRoute, removeMember);
router.get("/:id", protectedRoute, getUserGroups);
router.put("/:id/leave", protectedRoute, leaveGroup);

router.get("/:id/messages", protectedRoute, getGroupMessages);
router.post("/:id/send-group-message", protectedRoute, sendGroupMessage);

export default router;
