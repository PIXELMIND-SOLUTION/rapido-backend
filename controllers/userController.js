import User from '../models/User.js';
import Rider from '../models/Rider.js';
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

// ==================== FIND NEARBY RIDERS ====================
export const findNearbyRiders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, radius = 5 } = req.query;

    // ✅ Get user location
    let searchLat = latitude;
    let searchLng = longitude;

    if (!searchLat || !searchLng) {
      const user = await User.findById(userId).select('location');
      
      if (!user || !user.location || user.location.coordinates[0] === 0) {
        return res.status(400).json({
          success: false,
          message: 'User location not set. Please provide latitude and longitude or update your location first.'
        });
      }
      
      [searchLng, searchLat] = user.location.coordinates;
    }

    const lat = parseFloat(searchLat);
    const lng = parseFloat(searchLng);

    // ✅ Find nearby riders (only approved and online)
    const nearbyRiders = await Rider.find({
      isApproved: true,
      isOnline: true,
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000
        }
      }
    });

    // ✅ Super minimal response - only what's needed for map
    const formattedRiders = nearbyRiders.map(rider => ({
      id: rider._id,
      name: rider.fullName,
      lat: rider.currentLocation.coordinates[1],
      lng: rider.currentLocation.coordinates[0],
      vehicle: rider.vehicle.type,
      online: rider.isOnline
    }));

    return res.status(200).json({
      success: true,
      message: `Found ${formattedRiders.length} nearby riders`,
      data: {
        nearbyRiders: formattedRiders,
        count: formattedRiders.length,
        radius: radius,
        searchLocation: {
          latitude: lat,
          longitude: lng
        }
      }
    });
  } catch (err) {
    console.error('Find nearby riders error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to find nearby riders',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};