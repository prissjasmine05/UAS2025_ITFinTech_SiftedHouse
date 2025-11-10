import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  externalId: { 
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payerEmail: {
    type: String,
    required: true,
  },
  payerName: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false, 
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'], 
    default: 'PENDING',
  },
  cart: { 
    type: Array,
    required: true,
  },
  invoiceUrl: {
    type: String,
    required: false,
  },
  paidAt: {
    type: Date,
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, 
  },
}, { timestamps: true }); 

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);