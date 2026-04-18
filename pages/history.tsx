import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function History() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('StockLogs')
      .select(`
        *,
        Products (name)
      `)
      .order('created_at', { ascending: false });

    if (data) setLogs(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Stock History</h1>

      <ul className="mt-4 space-y-2">
        {logs.map(log => (
          <li key={log.id} className="border p-2 rounded">
            <strong>{log.Products?.name}</strong> → 
            {log.type === 'restock' ? ' + ' : ' - '}
            {Math.abs(log.change)} units
            <br />
            <small>{new Date(log.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}