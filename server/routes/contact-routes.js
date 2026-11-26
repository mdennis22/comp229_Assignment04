import express from "express";
import { createContact, deleteContacts, getAllContacts, getContactsById, updateContacts } from "../controllers/contact-controllers.js";
import authMiddleware from "../middlewares/auth.js";
import adminMiddleware from "../middlewares/admin.js";

const router = express.Router();

// CREATE - localhost:5000/api/contacts
router.post("/", createContact);

// READs
router.get("/", authMiddleware, adminMiddleware, getAllContacts);
router.get("/:id", authMiddleware, adminMiddleware, getContactsById);

// UPDATE
router.put("/:id", authMiddleware, adminMiddleware, updateContacts);

// DELETE
router.delete("/:id", authMiddleware, adminMiddleware, deleteContacts);

export default router;
