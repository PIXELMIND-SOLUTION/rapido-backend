import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as riderController from '../controllers/riderController.js';

const router = express.Router();

// ==================== RIDER PROFILE ====================
// Get rider profile (rider only)
router.get('/profile', authenticate, authorize('rider'), riderController.getMyProfile);

// Update rider profile (rider only)
router.put('/profile', authenticate, authorize('rider'), riderController.updateMyProfile);

// Set rider online/offline status (rider only)
router.put('/online-status', authenticate, authorize('rider'), riderController.setOnlineStatus);

// ==================== RIDER LOCATION ====================
// Update rider location (rider only)
router.put('/location', authenticate, authorize('rider'), riderController.updateRiderLocation);

// Get rider location by ID (any authenticated user)
router.get('/location/:riderId', authenticate, riderController.getRiderLocation);
router.get('/nearby/riders', authenticate, riderController.findNearbyRiders);

export default router;