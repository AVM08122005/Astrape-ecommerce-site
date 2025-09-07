// middleware/auth.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authMiddleware(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info so it's available in request
    req.user = decoded;

    return NextResponse.next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
