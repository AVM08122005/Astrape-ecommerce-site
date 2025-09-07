import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Item from "@/models/Item";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/**
 * Helper: get current user (returns user doc)
 */
async function getUserFromCookie() {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    throw new Error('Server configuration error');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).populate('cart.item').exec();
  return user;
}

/** GET /api/cart - returns current user's cart */
export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    // send cart with populated item details
    const cart = (user.cart || []).map(ci => ({
      item: ci.item ? {
        id: ci.item._id,
        title: ci.item.title,
        price: ci.item.price,
        image: ci.item.image,
        stock: ci.item.stock,
        category: ci.item.category
      } : null,
      quantity: ci.quantity,
      priceSnapshot: ci.priceSnapshot,
      addedAt: ci.addedAt
    }));

    return new Response(JSON.stringify({ cart }), { status: 200 });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

/** POST /api/cart - add item to cart
 * body: { itemId, quantity }
 */
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const { itemId, quantity = 1 } = body;
    if (!itemId) return new Response(JSON.stringify({ message: "itemId required" }), { status: 400 });

    const item = await Item.findById(itemId).lean();
    if (!item) return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // If item already in cart, increase quantity
    const existingIndex = user.cart.findIndex(ci => ci.item.toString() === itemId.toString());
    if (existingIndex > -1) {
      user.cart[existingIndex].quantity = Math.min((user.cart[existingIndex].quantity || 0) + qty, 1000);
      user.cart[existingIndex].priceSnapshot = item.price; // optionally update snapshot
    } else {
      user.cart.push({
        item: item._id,
        quantity: qty,
        priceSnapshot: item.price
      });
    }

    await user.save();
    // populate item for response
    await user.populate('cart.item');

    return new Response(JSON.stringify({ message: "Added to cart" }), { status: 200 });
  } catch (err) {
    console.error("POST /api/cart error:", err);
    // jwt.verify can throw a JsonWebTokenError; handle generically
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

/** PUT /api/cart - update quantity for item
 * body: { itemId, quantity }
 */
export async function PUT(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const { itemId, quantity } = body;
    if (!itemId || typeof quantity === "undefined") return new Response(JSON.stringify({ message: "itemId and quantity required" }), { status: 400 });

    console.log('PUT /api/cart - Looking for itemId:', itemId);
    console.log('PUT /api/cart - Cart items:', user.cart.map(ci => ({ itemId: ci.item?.toString?.() || ci.item, quantity: ci.quantity })));
    
    const idx = user.cart.findIndex(ci => {
      const cartItemId = ci.item?._id?.toString() || ci.item?.toString() || ci.item;
      return cartItemId === itemId.toString();
    });
    
    if (idx === -1) {
      console.log('PUT /api/cart - Item not found in cart');
      return new Response(JSON.stringify({ message: "Item not in cart" }), { status: 404 });
    }

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      // remove item if quantity <= 0
      user.cart.splice(idx, 1);
    } else {
      user.cart[idx].quantity = qty;
    }

    await user.save();
    return new Response(JSON.stringify({ message: "Cart updated" }), { status: 200 });
  } catch (err) {
    console.error("PUT /api/cart error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
