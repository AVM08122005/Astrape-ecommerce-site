import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Email and password required" }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // set httpOnly cookie with Next.js cookies API
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return new Response(
      JSON.stringify({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email } }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
