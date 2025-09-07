import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields required" }), { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return new Response(JSON.stringify({ message: "Email already registered" }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    return new Response(
      JSON.stringify({ message: "User created", user: { id: user._id, name: user.name, email: user.email } }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
