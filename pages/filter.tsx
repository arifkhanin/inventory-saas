import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import {getCurrentUser} from '../lib/getUser';

export default function Filter() {
  const [products, setProducts] = useState<Product[]>([]);
  const [minStock, setMinStock] = useState(0);
  
  const fetchProducts = async () => {
    const user = await getCurrentUser(); // ✅ using helper

    if (!user) return;

    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      return;
    }

    if (data) setProducts(data);
  };

    useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1>Filter Products</h1>

      <ul className="mt-4">
        {products.map(p => (
          <li key={p.id}>
            {p.name} - Stock: {p.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}