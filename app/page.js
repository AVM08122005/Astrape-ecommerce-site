"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function addToCart(productId, title) {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    
    try {
      // First, try to find the actual item by title in the database
      const itemsRes = await fetch('/api/items?q=' + encodeURIComponent(title), { credentials: 'include' });
      if (!itemsRes.ok) {
        alert('Could not find item in database');
        return;
      }
      
      const itemsData = await itemsRes.json();
      const matchingItem = itemsData.items?.find(item => 
        item.title.toLowerCase() === title.toLowerCase()
      );
      
      if (!matchingItem) {
        alert('Item not found in database. Please use the Shop page to add items.');
        return;
      }
      
      // Add the found item to cart
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId: matchingItem._id, quantity: 1 })
      });
      
      if (res.ok) {
        alert(`${title} added to cart!`);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Error adding to cart');
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white text-gray-900 antialiased">
      {/* HERO + NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/60 border-b">
        
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8 lg:pr-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-md animate-pulse">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="hidden sm:inline">Premium Quality • Fast Shipping • Exclusive Deals</span>
            <span className="sm:hidden">Premium Quality • Fast Shipping</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 animate-gradient">premium products</span> for your lifestyle
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
            Astrape offers a curated selection of high-quality products, from stylish clothing to cutting-edge electronics and accessories. Experience seamless shopping with secure checkout and fast delivery.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <Link href="/items" className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 hover:translate-y-[-2px] transition-all duration-300 font-medium w-full sm:w-auto">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l3-8H6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Shop Now
            </Link>

            {loading ? (
              <div className="inline-flex items-center justify-center px-6 py-3.5 bg-gray-300 text-gray-600 rounded-lg w-full sm:w-auto">
                Loading...
              </div>
            ) : user ? (
              <Link href="/cart" className="inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 font-medium w-full sm:w-auto">View Cart</Link>
            ) : (
              <Link href="/register" className="inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 font-medium w-full sm:w-auto">Create Account</Link>
            )}

            <div className="text-xs sm:text-sm bg-amber-50 text-amber-700 px-3 sm:px-4 py-2 rounded-full border border-amber-200 shadow-sm flex items-center gap-2 w-full sm:w-auto">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="hidden sm:inline">Free shipping on orders over $99</span>
              <span className="sm:hidden">Free shipping over $99</span>
            </div>
          </div>

          {/* Feature badges */}
          <div className="mt-8 flex flex-wrap gap-4">
            <FeatureBadge title="Secure Checkout" subtitle="Safe & protected" />
            <FeatureBadge title="Easy Returns" subtitle="30-day guarantee" />
            <FeatureBadge title="24/7 Support" subtitle="Always available" />
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="relative mt-8 lg:mt-0">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/90 p-4 sm:p-6 shadow-2xl border border-indigo-100 backdrop-blur">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2 bg-gradient-to-tr from-white to-indigo-50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                <img src="/headphones.jpg" alt="Premium Headphones" className="w-full sm:w-32 md:w-44 h-32 sm:h-28 md:h-36 object-cover rounded-lg shadow-md flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <div className="text-sm sm:text-base text-indigo-500 font-medium">Featured Product</div>
                  <div className="text-base sm:text-xl font-semibold">Premium Wireless Headphones</div>
                  <div className="mt-1 sm:mt-2 text-sm text-slate-600">Noise cancelling • 40h battery • Fast charge</div>
                  <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-indigo-700">$149</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
                <img src="/tshirt.jpg" alt="Premium T-Shirt" className="w-full h-24 object-cover rounded-lg mb-2" />
                <div className="text-sm font-medium">Premium T-Shirt</div>
                <div className="text-indigo-700 font-bold">$29</div>
              </div>
              
              <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-50 hover:shadow-md transition-shadow">
                <img src="/shoes.jpg" alt="Running Shoes" className="w-full h-24 object-cover rounded-lg mb-2" />
                <div className="text-sm font-medium">Performance Running Shoes</div>
                <div className="text-indigo-700 font-bold">$59</div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-50 flex items-center gap-2 hover:shadow-md transition-shadow">
                  <img src="/headphones.jpg" alt="Wireless Earbuds" className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <div className="text-xs text-indigo-500">New Arrival</div>
                    <div className="text-sm font-medium">Wireless Earbuds</div>
                    <div className="text-indigo-700 font-bold">$89</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-50 flex items-center gap-2 hover:shadow-md transition-shadow">
                  <img src="/shoes.jpg" alt="Sports Sneakers" className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <div className="text-xs text-indigo-500">Best Seller</div>
                    <div className="text-sm font-medium">Sports Sneakers</div>
                    <div className="text-indigo-700 font-bold">$69</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 left-6 bg-indigo-600 text-white rounded-full px-3 py-2 shadow-md flex items-center gap-2 text-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Free shipping on all orders
          </div>
        </div>
      </section>

      {/* PRODUCT GRID PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Popular picks</h2>
          <Link href="/items" className="text-xs sm:text-sm text-slate-600 hover:text-slate-900">View all →</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {previewProducts.map(p => (
            <ProductCard key={p.id} p={p} onAddToCart={addToCart} />
          ))}
        </div>
      </section>

      {/* CTA */}
      {!loading && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {user ? (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800">Welcome back, {user.name}!</h3>
                  <p className="text-sm text-slate-600">Continue shopping and discover amazing deals tailored just for you.</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/cart" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md shadow-md transition-colors">View Cart</Link>
                  <Link href="/items" className="px-5 py-2 border border-indigo-200 rounded-md text-indigo-700 hover:bg-indigo-50 transition-colors">Browse Store</Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-800">Join Astrape Today</h3>
                  <p className="text-sm text-slate-600">Create an account to enjoy exclusive deals and a personalized shopping experience.</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md shadow-md transition-colors">Create Account</Link>
                  <Link href="/items" className="px-5 py-2 border border-indigo-200 rounded-md text-indigo-700 hover:bg-indigo-50 transition-colors">Browse Store</Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      
    </main>
  );
}

/* ---------- Small components & data ---------- */

function FeatureBadge({ title, subtitle }) {
  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 shadow-sm">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <div className="font-semibold text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  );
}

function MiniCard({ img, title, price }) {
  return (
    <div className="bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-lg transition transform hover:-translate-y-1">
      <img src={img} alt={title} className="w-14 h-14 object-cover rounded" />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{price}</div>
      </div>
    </div>
  );
}

function SmallCard({ img, title, subtitle, price }) {
  return (
    <div className="bg-white rounded-lg p-3 flex items-center gap-3 hover:shadow-lg transition transform hover:-translate-y-1">
      <img src={img} alt={title} className="w-12 h-12 object-cover rounded" />
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold">{price}</div>
    </div>
  );
}

function ProductCard({ p, onAddToCart }) {
  return (
    <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition overflow-hidden border border-indigo-50">
      <div className="relative">
        <img src={p.img} alt={p.title} className="w-full h-28 sm:h-40 object-cover rounded-md" />
        <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">{p.tag}</div>
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="text-xs sm:text-sm font-medium line-clamp-2">{p.title}</div>
        <div className="mt-1 text-slate-600 text-xs sm:text-sm hidden sm:block">{p.desc}</div>
        <div className="mt-2 sm:mt-3 flex items-center justify-between">
          <div className="font-bold text-indigo-700 text-sm sm:text-base">${p.price}</div>
          <button 
            onClick={() => onAddToCart && onAddToCart(p.id, p.title)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const previewProducts = [
  { id: "bluetooth-headphones", title: "Bluetooth Headphones", price: "149", img: "/headphones.jpg", tag: "Featured", desc: "Noise cancelling, 40h battery" },
  { id: "blue-tshirt", title: "Blue T-Shirt", price: "29", img: "/tshirt.jpg", tag: "Bestseller", desc: "Soft cotton, all sizes" },
  { id: "running-shoes", title: "Running Shoes", price: "59", img: "/shoes.jpg", tag: "New", desc: "Lightweight, breathable" },
  { id: "wireless-earbuds", title: "Wireless Earbuds", price: "89", img: "/Earbuds.jpg", tag: "Trending", desc: "True wireless, water resistant" },
];
