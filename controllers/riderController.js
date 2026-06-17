import Rider from '../models/Rider.js';

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

export const getAllRiders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.verificationStatus = req.query.status;
    if (req.query.vehicleType) filter['vehicle.type'] = req.query.vehicleType;

    const [riders, total] = await Promise.all([
      Rider.find(filter)
        .populate('userId', 'name email phoneNumber')
        .select('-__v')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Rider.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Riders fetched',
      data: {
        riders,
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

export const updateVerification = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const validStatuses = ['pending', 'under_review', 'verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    rider.verificationStatus = status;
    rider.isApproved = status === 'verified';
    if (status === 'rejected') {
      rider.rejectionReason = rejectionReason || 'Documents invalid';
    }
    await rider.save();

    return res.status(200).json({
      success: true,
      message: `Rider ${status}`,
      data: {
        id: rider._id,
        verificationStatus: rider.verificationStatus,
        isApproved: rider.isApproved
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

export const getRiderById = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id)
      .populate('userId', 'name email phoneNumber');
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Rider fetched',
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