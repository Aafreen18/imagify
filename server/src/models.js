import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  creditBalance: { type: Number, required: true, default: 5, min: 0 },
}, { timestamps: true })

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  prompt: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true })

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planId: { type: String, required: true, enum: ['basic', 'advanced', 'premium'] },
  credits: { type: Number, required: true, min: 1 },
  amount: { type: Number, required: true, min: 1 }, // Whole rupees; currency is recorded separately as INR.
  currency: { type: String, required: true, default: 'INR' },
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  payment: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending', index: true },
}, { timestamps: true })

export const User = mongoose.model('User', userSchema)
export const GeneratedImage = mongoose.model('GeneratedImage', imageSchema)
export const Transaction = mongoose.model('Transaction', transactionSchema)
