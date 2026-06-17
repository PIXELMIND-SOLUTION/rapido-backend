import express from 'express';
import * as riderController from '../controllers/riderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, authorize('rider'), riderController.getMyProfile);
router.put('/profile', authenticate, authorize('rider'), riderController.updateMyProfile);
router.put('/online-status', authenticate, authorize('rider'), riderController.setOnlineStatus);
router.get('/all', authenticate, authorize('admin'), riderController.getAllRiders);
router.get('/:id', authenticate, authorize('admin'), riderController.getRiderById);
router.put('/verify/:id', authenticate, authorize('admin'), riderController.updateVerification);

export default router;