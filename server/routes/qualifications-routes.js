import express from "express";
import {
  createQualification,
  deleteQualification,
  getAllQualifications,
  getQualificationById,
  updateQualification,
} from "../controllers/qualifications-controllers.js";
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

const router = express.Router();

// CREATE - localhost:5000/api/qualifications
router.post("/", authMiddleware, adminMiddleware, createQualification);

// READs
router.get("/", getAllQualifications);
router.get("/:id", getQualificationById);

// UPDATE
router.put("/:id", authMiddleware, adminMiddleware, updateQualification);

// DELETE
router.delete("/:id", authMiddleware, adminMiddleware, deleteQualification);

export default router;
