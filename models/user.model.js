import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
export default User;
