import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getUserFromCookie() {
  await dbConnect();
  const cookiesStore = await cookies();
  const token = cookiesStore.get("token")?.value;
  if (!token) return null;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  return user;
}

export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    // Fix: Await params before destructuring
    const resolvedParams = await params;
    const itemId = resolvedParams.itemId;
    const idx = user.cart.findIndex(ci => ci.item.toString() === itemId.toString());
    if (idx === -1) return new Response(JSON.stringify({ message: "Item not in cart" }), { status: 404 });

    user.cart.splice(idx, 1);
    await user.save();
    return new Response(JSON.stringify({ message: "Removed from cart" }), { status: 200 });
  }
  catch (err) {
    console.error("DELETE /api/cart/[itemId] error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
