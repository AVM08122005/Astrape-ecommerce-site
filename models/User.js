import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  priceSnapshot: { type: Number, required: true }, // price at time added
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { type: String, required: true }, // hashed in controller
    cart: { type: [CartItemSchema], default: [] }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
