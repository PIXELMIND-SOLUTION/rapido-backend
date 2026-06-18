import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// ==================== USER PROFILE ====================
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// ==================== USER LOCATION ====================
router.put('/location', authenticate, userController.updateUserLocation);
router.get('/location', authenticate, userController.getUserLocation);
router.get('/nearby/users', authenticate, userController.findNearbyUsers);

export default router;