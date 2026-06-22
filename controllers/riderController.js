import Rider from '../models/Rider.js';
import User from '../models/User.js';

// ==================== RIDER PROFILE ====================
export const getMyProfile = async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.user.id })
      .populate('userId', 'name email phoneNumber')
      .select('-__v');
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Rider profile fetched',
      data: { rider }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const allowed = ['gender', 'address', 'bank', 'vehicle.color', 'vehicle.image'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const rider = await Rider.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true }
    );
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { rider }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

export const setOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const rider = await Rider.findOne({ userId: req.user.id });
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    if (!rider.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Account not approved'
      });
    }

    rider.isOnline = isOnline;
    await rider.save();
    return res.status(200).json({
      success: true,
      message: `You are now ${isOnline ? 'online' : 'offline'}`,
      data: { isOnline }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
  }
};

// ==================== RIDER LOCATION ====================
export const updateRiderLocation = async (req, res) => {
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

    const rider = await Rider.findOne({ userId });
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider profile not found'
      });
    }

    rider.currentLocation = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      address: address || '',
      updatedAt: new Date()
    };

    await rider.save();

    return res.status(200).json({
      success: true,
      message: 'Rider location updated',
      data: {
        location: rider.currentLocation
      }
    });
  } catch (err) {
    console.error('Update rider location error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update rider location',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export const getRiderLocation = async (req, res) => {
  try {
    const { riderId } = req.params;

    const rider = await Rider.findById(riderId).select('currentLocation');
    
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rider location fetched',
      data: {
        location: rider.currentLocation || {
          coordinates: [0, 0],
          address: '',
          updatedAt: null
        }
      }
    });
  } catch (err) {
    console.error('Get rider location error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get rider location',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

// ==================== GET RIDER BY ID ====================
export const getRiderById = async (req, res) => {
  try {
    const { riderId } = req.params;

    // ✅ Find rider by ID
    const rider = await Rider.findById(riderId)
      .populate('userId', 'name phoneNumber email')
      .select('fullName dateOfBirth gender address aadhaar pan drivingLicense vehicle bank verificationStatus isApproved isOnline currentLocation rating totalRides totalEarnings createdAt');

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rider fetched successfully',
      data: { rider }
    });
  } catch (err) {
    console.error('Get rider by ID error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rider',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};
