import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Rider from '../models/Rider.js';

export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password -otp -__v');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Admin profile',
      data: { admin }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalRiders, pendingRiders, approvedRiders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Rider.countDocuments(),
      Rider.countDocuments({ verificationStatus: 'pending' }),
      Rider.countDocuments({ isApproved: true })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats',
      data: {
        totalUsers,
        totalRiders,
        pendingRiders,
        approvedRiders
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can create admins'
      });
    }

    const { name, email, phoneNumber, password, role } = req.body;

    const exists = await Admin.findOne({ $or: [{ email }, { phoneNumber }] });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    const admin = new Admin({
      name,
      email,
      phoneNumber,
      password,
      role: role || 'admin'
    });

    await admin.save();

    return res.status(201).json({
      success: true,
      message: 'Admin created',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};