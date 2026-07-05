import express from 'express';
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/ReviewController.js';
const router = express.Router();

router.post('/reviews', addReview);
router.get('/reviews', getReviews);
router.put('/reviews/:id', updateReview);    // <-- TAMBAHAN BARU
router.delete('/reviews/:id', deleteReview);

export default router;
