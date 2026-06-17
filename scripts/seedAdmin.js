import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await Admin.findOne({ email: 'superadmin@rapido.com' });
    if (existingAdmin) {
      console.log('⚠️ Super admin already exists.');
      process.exit(0);
    }

    const admin = new Admin({
      name: 'Super Admin',
      email: 'superadmin@rapido.com',
      phoneNumber: '+919999999999',
      password: 'Admin@1234',
      role: 'super_admin'
    });

    await admin.save();
    console.log('✅ Super admin created!');
    console.log('📧 Email: superadmin@rapido.com');
    console.log('🔑 Password: Admin@1234');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();