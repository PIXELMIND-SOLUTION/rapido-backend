import jwt from 'jsonwebtoken';

class TokenService {
  // Generate single token
  static generateToken(user) {
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role || 'user'
    };
    
    if (user.riderId) payload.riderId = user.riderId;
    if (user.email) payload.email = user.email;

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Get token for user
  static getToken(user) {
    return {
      token: this.generateToken(user),
      expiresIn: process.env.JWT_EXPIRE || '30d'
    };
  }
}

export default TokenService;