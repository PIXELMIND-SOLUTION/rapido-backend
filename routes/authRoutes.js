import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// OTP Routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

// Rider Registration (NO TOKEN REQUIRED)
router.post('/register/rider', authController.registerRider);

// Admin Registration (NO TOKEN REQUIRED)
router.post('/register/admin', authController.registerAdmin);

// Login Routes
router.post('/login/send-otp', authController.loginSendOTP);
router.post('/login/verify-otp', authController.loginVerifyOTP);

// Admin Login
router.post('/admin/login', authController.adminLogin);
router.post('/admin/verify-otp', authController.adminVerifyOTP);

// ==================== PROTECTED ROUTES ====================
// User Registration (Requires tempToken)
router.post('/register/user', authenticate, authController.registerUser);

// Logout
router.post('/logout', authenticate, authController.logout);

export default router;