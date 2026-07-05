import express from 'express';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../controllers/RoomController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/api/rooms', verifyToken, getAllRooms);
router.post('/api/rooms', verifyToken, isAdmin, createRoom);
router.put('/api/rooms/:id', verifyToken, isAdmin, updateRoom);
router.delete('/api/rooms/:id', verifyToken, isAdmin, deleteRoom);

export default router;