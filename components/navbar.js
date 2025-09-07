"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // quick attempt to detect logged in user
    // profile endpoint returns 401 if not logged in
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) { setUser(null); return; }
        const data = await res.json();
        setUser(data.user);
      } catch (e) {
        setUser(null);
      }
    })();
  }, [path]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-semibold text-primary">Astrape</Link>
            <Link href="/items" className="text-sm text-gray-600 hover:text-primary">Shop</Link>
            <Link href="/cart" className="text-sm text-gray-600 hover:text-primary">Cart</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">Hi, {user.name}</span>
                <button onClick={handleLogout}
                  className="text-sm bg-white border px-3 py-1 rounded hover:bg-gray-50">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm px-3 py-1 rounded bg-accent text-white">Login</Link>
                <Link href="/register" className="text-sm px-3 py-1 border rounded">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
