"use client";

import { useState } from "react";

export default function RequestQuoteModal({ isOpen, onClose, itemId, vendorEmail, vendorId }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          vendorEmail,
          vendorId,
          date,
          time,
          expectedGuests: Number(expectedGuests) || 0,
          message
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed');
      setSuccess('Request sent successfully');
      setDate(""); setTime(""); setExpectedGuests(""); setMessage("");
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message || 'Error sending request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Request a Quote</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e)=>setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Time</label>
            <input type="time" className="form-input" value={time} onChange={(e)=>setTime(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Expected Guests</label>
            <input type="number" min="0" className="form-input" value={expectedGuests} onChange={(e)=>setExpectedGuests(e.target.value)} placeholder="e.g., 50" />
          </div>
          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea className="form-input" rows={4} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Share any details or requirements" />
          </div>
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Request'}</button>
        </form>
      </div>
    </div>
  );
}


