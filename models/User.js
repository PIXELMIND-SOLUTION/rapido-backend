import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['user', 'rider'],
      default: 'user'
    },
    otp: {
      code: String,
      expiresAt: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // ✅ ADD LOCATION FIELD
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      address: {
        type: String,
        default: ''
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

userSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('User', userSchema);