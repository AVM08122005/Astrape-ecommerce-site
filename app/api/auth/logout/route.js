import { cookies } from "next/headers";

export async function POST() {
  try {
    // clear the token cookie
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0), // expired immediately
      path: "/",
    });

    return new Response(JSON.stringify({ message: "Logged out successfully" }), { status: 200 });
  } catch (err) {
    console.error("Logout error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
