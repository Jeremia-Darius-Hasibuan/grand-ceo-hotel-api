import express from 'express';
import { createPayment, getPayments, updatePayment, deletePayment } from '../controllers/PaymentController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/api/payments', verifyToken, createPayment);
router.get('/api/payments', verifyToken, getPayments);

router.put('/api/payments/:id', verifyToken, isAdmin, updatePayment);    
router.delete('/api/payments/:id', verifyToken, isAdmin, deletePayment);

export default router;