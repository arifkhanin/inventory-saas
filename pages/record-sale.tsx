import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/getUser';
import { Product } from '../types/product';
import { generateInvoiceNumber } from '../lib/generateInvoice';

export default function RecordSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [qty, setQty] = useState('');
  const [customer, setCustomer] = useState('');
  const invoiceNumber = generateInvoiceNumber();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const user = await getCurrentUser(); 

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

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      alert('Select a product');
      return;
    }

    const product = products.find(p => p.id.toString() === productId);

    if (!qty || Number(qty) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    const quantity = Number(qty); 

    if (!product || product.stock < quantity) {
      alert('Not enough stock');
      return;
    }

    // 🔹 Insert sale
    const { error: saleError } = await supabase.from('Sales').insert([{
      product_id: productId,
      quantity: quantity,
      total_price: product.price * quantity
    }]);

    if (saleError) {
      console.error(saleError);
      return;
    }

    // 🔹 Update stock
    const { error: updateError } = await supabase.from('Products').update(
      { stock: product.stock - quantity })
      .eq('id', productId);

    if (updateError) {
      console.error(updateError);
      return;
    }

    const { error: invoiceError } = await supabase.from('Invoices').insert([{
      invoice_number: invoiceNumber,
      product_id: productId,
      quantity: quantity,
      price: product.price,
      gst_rate: product.gst_rate,
      total_amount: product.price * quantity * (1 + product.gst_rate / 100),
      customer_name: customer
    }]);
    
    if (invoiceError) {
      console.error(invoiceError);
      return;
    }

    alert(`Sale recorded. Invoice: ${invoiceNumber}`);

    // 🔹 Audit log
    const { error: stockLogError } = await supabase.from('StockLogs').insert([{
      product_id: productId,
      change: -quantity,
      type: 'sale'
    }]);

    if (stockLogError) {
      console.error(stockLogError);
      return;
    }

    alert('Sale recorded');

    // 🔄 Refresh UI
    fetchProducts();
    setQty('');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Record Sale</h1>

      <form onSubmit={handleSale} className="space-y-3 mt-4">

        <select
          value={productId || ''}
          onChange={e => setProductId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Product</option>
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
          onChange={(e) => {
            let value = e.target.value;

            if (value === '') {
              setQty('');
              return;
            }

            value = value.replace(/^0+/, '');
            setQty(value);
          }}
          className="border p-2 rounded w-full"
        />
        <input
          placeholder="Customer Name"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Sell
        </button>

      </form>
    </div>
  );
}