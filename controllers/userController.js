import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile fetched',
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role
        }
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

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'user' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { phoneNumber: { $regex: req.query.search } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-otp -__v').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users fetched',
      data: {
        users,
        pagination: { total, page, pages: Math.ceil(total / limit) }
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

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'User deactivated',
      data: { id: user._id }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};