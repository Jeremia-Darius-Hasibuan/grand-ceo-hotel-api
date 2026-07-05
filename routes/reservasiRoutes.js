import express from "express";
import { createReservasi, getAllReservasi, updateStatusReservasi } from "../controllers/ReservasiController.js";
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post("/api/reservasi", verifyToken, createReservasi);
router.get("/api/reservasi", verifyToken, getAllReservasi);
router.put("/api/reservasi/:id", verifyToken, isAdmin, updateStatusReservasi);

export default router;
