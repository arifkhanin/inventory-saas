import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateInvoicePDF } from '../lib/generateInvoicePDF';
import {getCurrentUser} from '../lib/getUser';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);  

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('Invoices')
      .select(`*, Products (name)`)
      .order('created_at', { ascending: false });

    if (data) setInvoices(data);
  };

  const fetchProfile = async () => {
    const user = await getCurrentUser();
    if (!user) return;
  
    const { data } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  
    setProfile(data);
  };

  useEffect(() => {
    fetchInvoices();
    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Invoices</h1>

      <ul className="mt-4 space-y-2">
      {invoices.map(inv => (
        <li key={inv.id} className="p-4 border rounded">
            <strong>{inv.invoice_number}</strong><br/>
            Customer: {inv.customer_name}<br/>
            Amount: ₹{inv.total_amount}<br/>
            Date: {new Date(inv.created_at).toLocaleString()}<br/>

            <button
            onClick={() => generateInvoicePDF(inv, profile)}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
            >
            Download PDF
            </button>
        </li>
        ))}
      </ul>
    </div>
  );
}