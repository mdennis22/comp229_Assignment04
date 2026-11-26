import express from 'express';
import {
    createProject,
    deleteProject,
    getAllProjects,
    getProjectById,
    updateProject
} from '../controllers/projects-controllers.js';
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

const router = express.Router();

// REST API simulate CRUD

// READs
router.get("/", getAllProjects);
router.get("/:id", getProjectById);

// CREATE
router.post("/", authMiddleware, adminMiddleware, createProject);

// UPDATE
router.put("/:id", authMiddleware, adminMiddleware, updateProject);

// DELETE
router.delete("/:id", authMiddleware, adminMiddleware, deleteProject);

export default router;