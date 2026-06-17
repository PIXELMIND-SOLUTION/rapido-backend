import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateAdmin, adminController.getProfile);
router.get('/dashboard', authenticateAdmin, adminController.getDashboardStats);
router.post('/create', authenticateAdmin, adminController.createAdmin);

export default router;