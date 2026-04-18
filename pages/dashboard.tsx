import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/getUser';

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data } = await supabase
      .from('Products')
      .select('*')
      .eq('user_id', user.id);

    if (data) setProducts(data);
  };

  const totalStock = products.reduce((a, b) => a + b.stock, 0);
  const totalValue = products.reduce((a, b) => a + b.price * b.stock, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* 🔥 KPI Cards */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Products</h2>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Total Stock</h2>
          <p className="text-2xl font-bold">{totalStock}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-gray-500">Inventory Value</h2>
          <p className="text-2xl font-bold">₹{totalValue}</p>
        </div>

      </div>

      {/* 🔥 Product List */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Products</h2>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500">
              <th>Name</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td>{p.name}</td>
                <td>{p.stock}</td>
                <td>₹{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}