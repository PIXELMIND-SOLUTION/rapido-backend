import User from '../models/User.js';

// ==================== USER PROFILE ====================

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

// ==================== USER LOCATION ====================
export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude. Must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid longitude. Must be between -180 and 180'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'location.coordinates': [parseFloat(longitude), parseFloat(latitude)],
          'location.address': address || '',
          'location.updatedAt': new Date()
        }
      },
      { new: true }
    ).select('-otp -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: user.location
      }
    });
  } catch (err) {
    console.error('Update location error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update location',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export const getUserLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('location');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Location fetched successfully',
      data: {
        location: user.location || {
          coordinates: [0, 0],
          address: '',
          updatedAt: null
        }
      }
    });
  } catch (err) {
    console.error('Get location error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get location',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export const findNearbyUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { radius = 5 } = req.query;

    const user = await User.findById(userId).select('location');
    
    if (!user || !user.location || user.location.coordinates[0] === 0) {
      return res.status(400).json({
        success: false,
        message: 'User location not set. Please update location first.'
      });
    }

    const [longitude, latitude] = user.location.coordinates;

    const nearbyUsers = await User.find({
      _id: { $ne: userId },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000
        }
      }
    }).select('name phoneNumber location');

    return res.status(200).json({
      success: true,
      message: `Found ${nearbyUsers.length} nearby users`,
      data: {
        nearbyUsers,
        count: nearbyUsers.length,
        radius: radius
      }
    });
  } catch (err) {
    console.error('Find nearby users error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to find nearby users',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};