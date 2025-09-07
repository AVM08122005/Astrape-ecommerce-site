import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return new Response(JSON.stringify({ message: "No token" }), { status: 401 });

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return new Response(JSON.stringify({ message: "Server configuration error" }), { status: 500 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password -__v");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err) {
    console.error("Profile error:", err);
    return new Response(JSON.stringify({ message: "Invalid or expired token" }), { status: 401 });
  }
}
