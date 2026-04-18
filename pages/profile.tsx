import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/getUser';

export default function Profile() {
  const [form, setForm] = useState({
    company_name: '',
    gst_number: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setForm(data);
  };

  const handleSave = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    await supabase.from('Profiles').upsert({
      id: user.id,
      ...form
    });

    alert('Profile saved');
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold mb-4">Company Profile</h1>

      <input
        placeholder="Company Name"
        value={form.company_name}
        onChange={e => setForm({ ...form, company_name: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="GST Number"
        value={form.gst_number}
        onChange={e => setForm({ ...form, gst_number: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <textarea
        placeholder="Address"
        value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
        className="border p-2 w-full mb-2"
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}