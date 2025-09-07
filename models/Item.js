import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, index: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// compile model if not already compiled (prevents OverwriteModelError in dev)
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default Item;
