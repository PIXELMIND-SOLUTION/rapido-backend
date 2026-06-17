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
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);