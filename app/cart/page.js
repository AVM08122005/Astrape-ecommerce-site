"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const router = useRouter();

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function getImageForItem(item) {
    if (!item) return "/next.svg";
    if (
      item.imageUrl &&
      typeof item.imageUrl === "string" &&
      !item.imageUrl.includes("/images/")
    ) {
      return item.imageUrl;
    }
    const titleToImageMap = {
      "Blue T-Shirt": "/Bluetshirt.jpg",
      "Wireless Mouse": "/WirelessMouse.jpg",
      "Water Bottle": "/WaterBottle.jpg",
      "Bluetooth Headphones": "/headphones.jpg",
      "Wireless Earbuds": "/Earbuds.jpg",
      "Running Shoes": "/RunningShoes.jpg",
      "Sport Sneakers": "/SportSneakers.jpg",
      "T-Shirt": "/tshirt.jpg",
    };
    if (item.title && titleToImageMap[item.title]) return titleToImageMap[item.title];
    const titleLower = (item.title || "").toLowerCase();
    for (const [key, val] of Object.entries(titleToImageMap)) {
      if (titleLower.includes(key.toLowerCase())) return val;
    }
    if (item.category === "clothing") return "/tshirt.jpg";
    if (item.category === "electronics") return "/WirelessMouse.jpg";
    if (item.category === "accessories") return "/WaterBottle.jpg";
    return "/next.svg";
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(Array.isArray(data.cart) ? data.cart : []);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  function subtotal() {
    return cart.reduce((s, ci) => {
      const price = Number(ci.priceSnapshot ?? ci.item?.price ?? 0);
      const qty = Number(ci.quantity ?? 0);
      if (Number.isNaN(price) || Number.isNaN(qty)) return s;
      return s + price * qty;
    }, 0);
  }

  // helper for consistent id normalization across render / update / remove
  function cartLineIdOf(ci) {
    return String(ci.id ?? ci._id ?? ci.item?.id ?? ci.item?._id ?? "");
  }

  // Optimistic update for qty; rollback on failure
  async function updateQty(cartLineId, qty) {
    if (!cartLineId) return;
    qty = Math.max(1, Number(qty) || 1);
    setMsg("");
    setUpdatingItem(cartLineId);

    const prevCart = cart; // snapshot for rollback

    // Find the item ID from the cart line
    const cartItem = prevCart.find(ci => cartLineIdOf(ci) === String(cartLineId));
    if (!cartItem || !cartItem.item) {
      setMsg("Cannot find item to update");
      return;
    }
    
    const itemId = cartItem.item.id || cartItem.item._id;

    // optimistic update locally
    setCart(prev =>
      prev.map(ci => {
        const idStr = cartLineIdOf(ci);
        if (idStr === String(cartLineId)) return { ...ci, quantity: qty };
        return ci;
      })
    );

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId, quantity: qty }),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setMsg(b.message || "Failed to update quantity");
        setCart(prevCart); // rollback
        return;
      }

      // success: optionally re-fetch to sync canonical server state
      // await fetchCart();
    } catch (e) {
      console.error(e);
      setMsg("Server error");
      setCart(prevCart); // rollback
    } finally {
      setUpdatingItem(null);
    }
  }

  async function removeItem(cartLineId) {
    if (!cartLineId) return;
    setMsg("");
    setRemovingItem(cartLineId);

    try {
      // optimistic remove locally
      const prevCart = cart;
      setCart(prev => prev.filter(ci => cartLineIdOf(ci) !== String(cartLineId)));

      // Find the item ID from the cart line
      const cartItem = prevCart.find(ci => cartLineIdOf(ci) === String(cartLineId));
      if (!cartItem || !cartItem.item) {
        setMsg("Cannot find item to remove");
        setCart(prevCart); // rollback
        return;
      }
      
      const itemId = cartItem.item.id || cartItem.item._id;
      const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMsg(body.message || "Failed to remove item on server — refresh to retry");
        setCart(prevCart); // rollback
        return;
      }
    } catch (e) {
      console.error("removeItem error:", e);
      setMsg("Server error while removing item");
      await fetchCart(); // re-sync
    } finally {
      setRemovingItem(null);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Your Cart</h1>
      {msg && (
        <div className="mb-4 text-sm text-red-600" role="alert">
          {msg}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p>Your cart is empty</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
            onClick={() => router.push("/items")}
          >
            Shop now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items ({cart.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
            {cart.map((ci) => {
              const cartLineId = cartLineIdOf(ci);
              const item = ci.item ?? {};
              const price = Number(ci.priceSnapshot ?? item.price ?? 0);
              const qty = Number(ci.quantity ?? 0);

              return (
                <div
                  key={cartLineId || Math.random()}
                  className="p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={getImageForItem(item)}
                        alt={item.title || "product"}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.title || "(item removed)"}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            ${isNaN(price) ? "0.00" : price.toFixed(2)} each
                          </p>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            {item.category || 'Product'}
                          </p>
                        </div>
                        
                        {/* Remove button - top right */}
                        <button
                          onClick={() => removeItem(cartLineId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          disabled={removingItem === cartLineId}
                          title="Remove item"
                        >
                          {removingItem === cartLineId ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* Quantity and Price Row */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Qty:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQty(cartLineId, Math.max(1, qty - 1))}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              disabled={updatingItem === cartLineId || removingItem === cartLineId}
                              aria-label="Decrease quantity"
                            >
                              {updatingItem === cartLineId && updatingItem === cartLineId ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              )}
                            </button>
                            <div className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center" aria-live="polite">
                              {qty}
                            </div>
                            <button
                              onClick={() => updateQty(cartLineId, qty + 1)}
                              className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                              disabled={updatingItem === cartLineId || removingItem === cartLineId}
                              aria-label="Increase quantity"
                            >
                              {updatingItem === cartLineId ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Item total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${isNaN(price * qty) ? "0.00" : (price * qty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                    <span className="font-medium">{currency.format(subtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cart.length > 0 && subtotal() > 99 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        currency.format(20)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-medium">{currency.format(subtotal() * 0.18)}</span>
                  </div>
                  
                  {cart.length > 0 && subtotal() <= 99 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        Add ${(99 - subtotal()).toFixed(2)} more for free shipping!
                      </p>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {currency.format(
                          subtotal() +
                            (cart.length > 0 && subtotal() > 99 ? 0 : 20) + 
                            subtotal() * 0.18
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => {
                      if (cart.length > 0)
                        setMsg("Checkout functionality will be implemented soon!");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-lg font-semibold text-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                    disabled={cart.length === 0}
                    aria-disabled={cart.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => router.push("/items")}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
