import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/getUser';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse'
import { getUserContext } from '../lib/getUserContext';

export default function AddCustomer() {
  const [rows, setRows] = useState([
    { name: '', price: '', gst: '', stock: '' }
  ]);

  const [loading, setLoading] = useState(false);

  // 🔹 Add new row
  const addRow = () => {
    setRows([...rows, { name: '', address: '', contact_name: '', phone: '', gst_number: '', pan_number: '' }]);
  };

  // Handle CSV upload
  const handleCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setRows(results.data);
      }
    });
  };

  const handleImage = async (file) => {
    const { data } = await Tesseract.recognize(file, 'eng');
  
    console.log(data.text);
    // parse text → convert to rows
  };

  //await supabase.from('Customers').delete().eq('id', id);  
  // 🔹 Remove row
  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  // 🔹 Handle input change
  const handleChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    (newRows[index] as any)[field] = value;
    setRows(newRows);
  };

  // 🔥 Bulk Save
  const handleBulkSave = async () => {
    setLoading(true);

    const user = await getCurrentUser();
    if (!user) return;

    try {
      for (const row of rows) {
        if (!row.name) continue;

        // 🔍 Check if exists
        const { data: existing } = await supabase
          .from('Customers')
          .select('*')
          .eq('name', row.name)
          .eq('client_id', user.client_id)
          .eq('branch_id', user.branch_id)
          .eq('user_id', user.id) // temporary safety
          .maybeSingle();

        if (existing) {
          // 🔄 Update stock
          await supabase
            .from('Customers')
            .update({
              address: row.address,
              contact_name: row.contact_name,
              phone: row.phone,
              gst_number: row.gst_number,
              pan_number: row.pan_number
            })
            .eq('id', existing.id);
        } else {
          // ➕ Insert new
          await supabase.from('Customers').insert([{
            name: row.name,
            address: row.address,
            contact_name: row.contact_name,
            phone: row.phone,
            gst_number: row.gst_number,
            pan_number: row.pan_number,
            user_id: user.id
          }]);
        }
      }

      alert('Customers saved!');

      // 🔄 Reset grid
      setRows([...rows, { name: '', address: '', contact_name: '', phone: '', gst_number: '', pan_number: '' }]);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Customers</h1>

      {/* 🔥 Grid */}
      <div className="bg-white p-4 rounded-xl shadow space-y-2">

        {/* Header */}
        <div className="grid grid-cols-5 gap-2 font-semibold text-gray-600">
          <div>Name</div>
          <div>Address</div>
          <div>Contact Name %</div>
          <div>Phone</div>
          <div>GST Number</div>
          <div>PAN Number</div>
          <div>Action</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">

            <input
              className="border p-2 rounded"
              placeholder="Customer name"
              value={row.name}
              onChange={e => handleChange(i, 'name', e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="Address"
              value={row.address}
              onChange={e => handleChange(i, 'address', e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="Contact Name"
              value={row.contact_name}
              onChange={e => handleChange(i, 'contact_name', e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="Phone"
              value={row.phone}
              onChange={e => handleChange(i, 'phone', e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="GST Number"
              value={row.gst_number}
              onChange={e => handleChange(i, 'gst_number', e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="PAN Number"
              value={row.pan_number}
              onChange={e => handleChange(i, 'pan_number', e.target.value)}
            />

            <button
              onClick={() => removeRow(i)}
              className="bg-red-500 text-white rounded px-2"
            >
              X
            </button>

          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={addRow}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            + Add Row
          </button>

          <button
            onClick={handleBulkSave}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save All'}
          </button>
        </div>

      </div>
    </div>
  );
}