import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qty: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now }
});

// unique index to avoid duplicate user+item pairs
CartItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);
export default CartItem;
