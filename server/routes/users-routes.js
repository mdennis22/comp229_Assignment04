import express from "express";
import { createUser, getAllUsers, getUserById, loginUser } from "../controllers/users-controllers.js";
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

const router = express.Router();

// CREATE - localhost:5000/api/users
router.post("/", createUser);

// READs
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUserById);

router.post("/login", loginUser);

export default router;
