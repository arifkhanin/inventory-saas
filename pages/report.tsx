import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

export default function Report() {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('client_id', user.client_id)
      .eq('branch_id', user.branch_id)
      .eq('user_id', user.id) // temporary safety;

    if (error) {
      console.error(error);
      return;
    }

    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts(); // ✅ FIXED
  }, []);

  const totalStock = products.reduce((a, b) => a + b.stock, 0);
  const totalValue = products.reduce((a, b) => a + b.price * b.stock, 0);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Report</h1>

      <p className="mt-4">Total Stock: {totalStock}</p>
      <p>Total Value: ₹{totalValue}</p>
    </div>
  );
}