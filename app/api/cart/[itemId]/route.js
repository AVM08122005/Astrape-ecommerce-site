import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
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

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(req, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return new Response(JSON.stringify({ message: "Please login" }), { status: 401 });
    }

    const { itemId } = await params;

    console.log('🗑️ DELETE /api/cart/[itemId] - Deleting itemId:', itemId);
    console.log('🗑️ DELETE /api/cart/[itemId] - Current cart:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));

    const itemIndex = user.cart.findIndex(
      ci => ci.item.toString() === itemId.toString()
    );

    console.log('🗑️ DELETE /api/cart/[itemId] - Found at index:', itemIndex);

    if (itemIndex === -1) {
      console.log('ℹ️ DELETE /api/cart/[itemId] - Item already removed, returning success');
      return new Response(JSON.stringify({ message: "Item removed" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    console.log('✅ DELETE /api/cart/[itemId] - Cart after save:', user.cart.map(ci => ({
      itemId: ci.item.toString(),
      qty: ci.quantity
    })));

    return new Response(JSON.stringify({ message: "Item removed" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("❌ DELETE /api/cart/[itemId] error:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}


