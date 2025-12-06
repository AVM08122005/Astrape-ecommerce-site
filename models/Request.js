import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorEmail: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  expectedGuests: { type: Number, default: 0 },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const RequestModel = mongoose.models.Request || mongoose.model('Request', RequestSchema);

export default RequestModel;


