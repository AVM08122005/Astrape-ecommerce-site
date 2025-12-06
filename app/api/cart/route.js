import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Item from "@/models/Item";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuthUser() {
  await dbConnect();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user;
  } catch (error) {
    return null;
  }
}

// GET /api/cart - Fetch user's cart
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return new Response(JSON.stringify({ message: "Please login" }), { status: 401 });
    }

    console.log('📦 GET /api/cart - Raw cart before populate:', JSON.stringify(user.cart, null, 2));

    // Populate cart items
    await user.populate('cart.item');
    
    console.log('📦 GET /api/cart - Cart after populate:', user.cart.map(ci => ({
      itemId: ci.item?._id?.toString(),
      title: ci.item?.title,
      quantity: ci.quantity
    })));
    
    const cart = user.cart.map(cartItem => ({
      item: cartItem.item ? {
        id: cartItem.item._id.toString(),
        title: cartItem.item.title,
        price: cartItem.item.price,
        imageUrl: cartItem.item.imageUrl,
        category: cartItem.item.category
      } : null,
      quantity: cartItem.quantity,
      priceSnapshot: cartItem.priceSnapshot
    })).filter(ci => ci.item !== null);

    console.log('📦 GET /api/cart - Returning cart:', cart);

    return new Response(JSON.stringify({ cart }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ GET /api/cart error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return new Response(JSON.stringify({ message: "Please login" }), { status: 401 });
    }

    const { itemId, quantity = 1 } = await req.json();
    
    console.log('➕ POST /api/cart - Adding itemId:', itemId, 'quantity:', quantity);
    console.log('➕ POST /api/cart - Current cart:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));
    
    if (!itemId) {
      return new Response(JSON.stringify({ message: "Item ID required" }), { status: 400 });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });
    }

    const qty = Math.max(1, parseInt(quantity));

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      ci => ci.item.toString() === itemId.toString()
    );

    console.log('➕ POST /api/cart - Existing item index:', existingItemIndex);

    if (existingItemIndex >= 0) {
      // Item exists - increment quantity
      console.log('➕ POST /api/cart - Item exists, incrementing from', user.cart[existingItemIndex].quantity, 'to', user.cart[existingItemIndex].quantity + qty);
      user.cart[existingItemIndex].quantity += qty;
    } else {
      // Item doesn't exist - add new entry
      console.log('➕ POST /api/cart - Item does not exist, adding new entry');
      user.cart.push({
        item: item._id,
        quantity: qty,
        priceSnapshot: item.price
      });
    }

    await user.save();
    
    console.log('✅ POST /api/cart - Cart after save:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));

    return new Response(JSON.stringify({ message: "Added to cart" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ POST /api/cart error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return new Response(JSON.stringify({ message: "Please login" }), { status: 401 });
    }

    const { itemId, quantity } = await req.json();
    
    console.log('🔄 PUT /api/cart - Updating itemId:', itemId, 'to quantity:', quantity);
    console.log('🔄 PUT /api/cart - Current cart:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));
    
    if (!itemId || quantity === undefined) {
      return new Response(JSON.stringify({ message: "Item ID and quantity required" }), { status: 400 });
    }

    const qty = parseInt(quantity);
    
    const itemIndex = user.cart.findIndex(
      ci => ci.item.toString() === itemId.toString()
    );

    console.log('🔄 PUT /api/cart - Found at index:', itemIndex);

    if (itemIndex === -1) {
      console.log('❌ PUT /api/cart - Item not found in cart');
      return new Response(JSON.stringify({ message: "Item not in cart" }), { status: 404 });
    }

    if (qty <= 0) {
      // Remove item from cart
      console.log('🗑️ PUT /api/cart - Removing item from cart');
      user.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      console.log('🔄 PUT /api/cart - Updating quantity from', user.cart[itemIndex].quantity, 'to', qty);
      user.cart[itemIndex].quantity = Math.min(qty, 999);
    }

    await user.save();
    
    console.log('✅ PUT /api/cart - Cart after save:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));

    return new Response(JSON.stringify({ message: "Cart updated" }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ PUT /api/cart error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
