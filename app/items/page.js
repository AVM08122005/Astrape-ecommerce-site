"use client";
import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    price_min: "",
    price_max: "",
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [addingToCart, setAddingToCart] = useState(null);

  function getImageForItem(item) {
    if (!item) return "/next.svg";
    if (item.imageUrl && !item.imageUrl.includes("/images/"))
      return item.imageUrl;
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
    if (item.title && titleToImageMap[item.title])
      return titleToImageMap[item.title];
    for (const [key, value] of Object.entries(titleToImageMap)) {
      if (item.title && item.title.toLowerCase().includes(key.toLowerCase()))
        return value;
    }
    if (item.category === "clothing") return "/tshirt.jpg";
    if (item.category === "electronics") return "/WirelessMouse.jpg";
    if (item.category === "accessories") return "/WaterBottle.jpg";
    return "/next.svg";
  }

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  async function fetchItems() {
    setLoading(true);
    setMsg("");
    try {
      const ps = new URLSearchParams();
      if (filters.q) ps.set("q", filters.q);
      if (filters.category) ps.set("category", filters.category);
      if (filters.price_min) ps.set("price_min", filters.price_min);
      if (filters.price_max) ps.set("price_max", filters.price_max);

      const res = await fetch("/api/items?" + ps.toString(), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      // ensure inCart flag exists (false by default) so UI can rely on it
      const normalized = (data.items || []).map((it) => ({
        ...it,
        inCart: !!it.inCart,
      }));
      setItems(normalized);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  // Optimistic add-to-cart — mark only the clicked item as inCart immediately
  async function addToCart(itemId) {
    if (!itemId) return;
    setMsg("");
    setAddingToCart(itemId);

    // keep a copy for rollback in case server fails
    const prevItems = items;

    // optimistic update: mark only this item
    setItems((prev) =>
      prev.map((it) => (it._id === itemId ? { ...it, inCart: true } : it))
    );

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId, quantity: 1 }),
      });

      if (res.ok) {
        setMsg("Added to cart");
        // optionally you can re-fetch cart here or save returned cartLineId for future edits
        // const body = await res.json();
      } else if (res.status === 401) {
        setMsg("Please login to add to cart");
        // rollback
        setItems(prevItems);
      } else {
        const b = await res.json().catch(() => ({}));
        setMsg(b.message || "Could not add");
        setItems(prevItems);
      }
    } catch (e) {
      console.error(e);
      setMsg("Server error");
      setItems(prevItems);
    } finally {
      setAddingToCart(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Mobile-first header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">Shop</h1>

        {/* Mobile-responsive filters */}
        <div className="space-y-3 sm:space-y-0">
          {/* Primary search - full width on mobile */}
          <div className="w-full my-3">
            <input
              className="w-full border rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search products..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>

          {/* Filters grid - responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="border rounded-lg px-3 py-1 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Category"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            />
            <input
              className="border rounded-lg px-3 py-1 text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Min Price"
              type="number"
              value={filters.price_min}
              onChange={(e) =>
                setFilters({ ...filters, price_min: e.target.value })
              }
            />
            <input
              className="border rounded-lg px-3 py-1     text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Max Price"
              type="number"
              value={filters.price_max}
              onChange={(e) =>
                setFilters({ ...filters, price_max: e.target.value })
              }
            />
            <button
              onClick={fetchItems}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors sm:col-span-2 lg:col-span-1"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading products...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No products found</div>
          <button
            onClick={() =>
              setFilters({ q: "", category: "", price_min: "", price_max: "" })
            }
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((it) => (
            <div
              key={it._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden"
            >
              <div className="relative overflow-hidden h-48 sm:h-52 lg:h-56">
                <img
                  src={getImageForItem(it)}
                  alt={it.title || "product"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {it.title}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {it.category}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    ${it.price}
                  </div>
                  <button
                    onClick={() => addToCart(it._id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      it.inCart
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md"
                    }`}
                    disabled={addingToCart === it._id || it.inCart}
                    aria-disabled={addingToCart === it._id || it.inCart}
                  >
                    {addingToCart === it._id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Adding...
                      </>
                    ) : it.inCart ? (
                      "✓ In Cart"
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
