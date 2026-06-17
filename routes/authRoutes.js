import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Registration Routes
router.post('/register/user', authenticate, authController.registerUser);
router.post('/register/rider', authenticate, authController.registerRider);

// Login Routes
router.post('/login/send-otp', authController.loginSendOTP);
router.post('/login/verify-otp', authController.loginVerifyOTP);

// ❌ REMOVED: /refresh-token route

// Logout
router.post('/logout', authenticate, authController.logout);

// Admin Routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/verify-otp', authController.adminVerifyOTP);

export default router;