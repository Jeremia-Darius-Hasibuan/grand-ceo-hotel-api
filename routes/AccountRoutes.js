import express from 'express';
import {
    getAllUsers, registerUser,
    getCategories, addCategory,
    updateCategory, deleteCategory 
} from '../controllers/Authcontroller.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', registerUser);

router.get('/categories', getCategories);
router.post('/categories', addCategory);

router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;