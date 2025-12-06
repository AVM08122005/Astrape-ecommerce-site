"use client";

import { useEffect, useState } from "react";
import RequestQuoteModal from "@/components/RequestQuoteModal";

export default function ItemDetailPage({ params }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const id = (await params).id;
        const res = await fetch(`/api/items/${id}`);
        const json = await res.json();
        setItem(json.item);
        // load reviews after item
        const rv = await fetch(`/api/reviews?productId=${id}`);
        const rj = await rv.json();
        const list = rj.reviews || [];
        setReviews(list);
        if (list.length > 0) {
          const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0);
          setAvgRating((sum / list.length).toFixed(1));
        } else {
          setAvgRating(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!item) return <div className="p-6">Not found</div>;

  const vendorName = item.vendorId?.name || 'Unknown vendor';
  const vendorEmail = item.vendorId?.contact_email || '';
  const vendorId = item.vendorId?._id || '';
  const vendorVerified = !!item.vendorId?.verified;

  return (
    <div className="grid md:grid-cols-2 gap-6 py-8">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl || '/tshirt.jpg'} alt={item.title} className="w-full rounded-lg shadow" />
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold">{item.title}</h1>
          {avgRating && (
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⭐ {avgRating}</span>
          )}
        </div>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <p className="text-xl font-bold mb-2">${item.price}</p>
        <p className="text-sm text-gray-500 mb-6">Vendor: {vendorName} {vendorVerified && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified Vendor</span>}</p>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={() => setShowQuote(true)}>Request Quote</button>
        </div>

        {/* Reviews */}
        <div className="mt-8">
          <h2 className="font-semibold mb-2">Reviews</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="border rounded p-3">
                <div className="text-sm font-medium">{r.name} · <span className="text-yellow-700">{`⭐`.repeat(Number(r.rating) || 0)}</span></div>
                <div className="text-sm text-gray-700">{r.comment}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-sm text-gray-600">No reviews yet.</div>}
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Add a review</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setSubmittingReview(true);
              try {
                const res = await fetch('/api/reviews', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    productId: item._id,
                    vendorId,
                    name: form.name.value,
                    rating: Number(form.rating.value),
                    comment: form.comment.value,
                  })
                });
                if (!res.ok) throw new Error('Failed');
                const r = await res.json();
                const newReviews = [r.review, ...reviews];
                setReviews(newReviews);
                const sum = newReviews.reduce((acc, rr) => acc + Number(rr.rating || 0), 0);
                setAvgRating((sum / newReviews.length).toFixed(1));
                form.reset();
              } catch (e) {
                alert('Failed to submit review');
              } finally {
                setSubmittingReview(false);
              }
            }} className="space-y-2">
              <input name="name" placeholder="Your name" className="form-input" required />
              <select name="rating" className="form-input" defaultValue="5" required>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
              <textarea name="comment" placeholder="Share your experience" rows={3} className="form-input" />
              <button disabled={submittingReview} className="btn-primary">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          </div>
        </div>
      </div>

      {showQuote && (
        <RequestQuoteModal
          isOpen={showQuote}
          onClose={() => setShowQuote(false)}
          itemId={item._id}
          vendorEmail={vendorEmail}
          vendorId={vendorId}
        />
      )}
    </div>
  );
}


