import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

export default function Restock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
  
    if (!user) return;
  
    const { data } = await supabase
      .from('Products')
      .select('*')
      .eq('client_id', user.client_id)
      .eq('branch_id', user.branch_id)
      .eq('user_id', user.id) // temporary safety;
  
    if (data) setProducts(data);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find(p => p.id.toString() === productId);
    if (!product) return;

    const quantity = Number(qty);

    // 🔹 Update stock
    await supabase
      .from('Products')
      .update({ stock: product.stock + quantity })
      .eq('id', productId);

    // 🔹 Log it
    await supabase.from('StockLogs').insert([{
      product_id: productId,
      change: quantity,
      type: 'restock'
    }]);

    alert('Stock updated!');
    setQty('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Restock Product</h1>

      <form onSubmit={handleRestock} className="space-y-3 mt-4">

        <select onChange={e => setProductId(e.target.value)}>
          <option>Select Product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Restock
        </button>

      </form>
    </div>
  );
}