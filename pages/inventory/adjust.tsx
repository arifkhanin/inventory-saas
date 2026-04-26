import { useEffect, useState } from 'react';
import { getUserContext } from '../../lib/auth';

type Variant = {
  id: string;
  label: string;
};

export default function AdjustPage() {
  const [user, setUser] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [direction, setDirection] = useState('increase');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initPage();
  }, []);

  async function initPage() {
    const dbUser = await getUserContext();

    if (!dbUser) {
      setMessage('Please login first');
      return;
    }

    setUser(dbUser);

    await loadVariants(dbUser);
  }

  async function loadVariants(dbUser: any) {
    const res = await fetch('/api/inventory/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          id: dbUser.id
        }
      })
    });

    const text = await res.text();

    let data: any = {};

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }

    if (res.ok) {
      setVariants(data);
    } else {
      setMessage(data.error || 'Failed loading variants');
    }
  }

  async function handleSubmit() {
    try {
      setMessage('');
  
      if (!variantId) {
        setMessage('Select variant');
        return;
      }
  
      if (!quantity || Number(quantity) <= 0) {
        setMessage('Enter valid quantity');
        return;
      }
  
      if (!reason.trim()) {
        setMessage('Reason required');
        return;
      }
  
      if (!user) {
        setMessage('User not loaded');
        return;
      }
  
      setLoading(true);
  
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: user.id },
          variant_id: variantId,
          quantity: Number(quantity),
          direction,
          reason
        })
      });
  
      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
  
      if (res.ok) {
        setMessage('Adjustment successful');
        setVariantId('');
        setQuantity('');
        setReason('');
        setDirection('increase');
      } else {
        setMessage(data.error || 'Adjustment failed');
      }
  
    } catch (error) {
      console.error(error);
      setMessage('Server error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventory Adjustment</h1>

      {message && (
        <div className="mb-4 text-sm text-blue-700">
          {message}
        </div>
      )}

      <select
        value={variantId}
        onChange={(e) => setVariantId(e.target.value)}
        className="border p-2 w-full mb-3"
      >
        <option value="">Select Variant</option>

        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {v.label}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <select
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        className="border p-2 w-full mb-3"
      >
        <option value="increase">Increase</option>
        <option value="decrease">Decrease</option>
      </select>

      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white w-full p-2 rounded"
      >
        {loading ? 'Submitting...' : 'Submit Adjustment'}
      </button>
    </div>
  );
}