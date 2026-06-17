import TokenService from '../utils/tokenService.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Response helpers inside middleware
const error = (res, statusCode, message, err = null) => {
  const response = { success: false, message };
  if (err && process.env.NODE_ENV === 'development') {
    response.error = err;
  }
  return res.status(statusCode).json(response);
};

const tokenExpired = (res) => {
  return res.status(401).json({
    success: false,
    message: 'Session expired. Please login again.',
    code: 'TOKEN_EXPIRED'
  });
};

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return error(res, 401, 'Authentication required.');
    }

    const decoded = TokenService.verifyToken(token);
    
    if (!decoded) {
      return tokenExpired(res);
    }

    const user = await User.findById(decoded.id).select('-otp');
    
    if (!user) {
      return error(res, 401, 'User not found.');
    }
    
    if (!user.isActive) {
      return error(res, 403, 'Account deactivated.');
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Authentication failed.', err.message);
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return error(res, 401, 'Authentication required.');
    }

    const decoded = TokenService.verifyToken(token);
    
    if (!decoded) {
      return tokenExpired(res);
    }

    const admin = await Admin.findById(decoded.id).select('-password -otp');
    
    if (!admin) {
      return error(res, 401, 'Admin not found.');
    }
    
    if (!admin.isActive) {
      return error(res, 403, 'Admin account deactivated.');
    }

    req.admin = admin;
    next();
  } catch (err) {
    return error(res, 401, 'Authentication failed.', err.message);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 403, `Access denied. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};