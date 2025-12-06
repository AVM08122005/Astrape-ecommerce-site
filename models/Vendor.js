import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  location: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  description: { type: String, default: '' },
  contact_email: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

export default Vendor;


