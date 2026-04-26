import { supabase } from '../../../lib/supabase';
import { apiGuard } from '../../../lib/apiGuard';
import { applyTenantFilter } from '../../../lib/tenantQuery';

export default async function handler(req, res) {
  const { ids } = req.body;

  const dbUser = await apiGuard(req, res, 'products', 'delete');
  if (!dbUser) return;

  if (!ids || ids.length === 0) {
    return res.status(400).send("No IDs provided");
  }

  let query = supabase
    .from('products')
    .delete()
    .in('id', ids)
    
  query = applyTenantFilter(query, dbUser);
  const { data, error } = await query.select();

  console.log("BULK DELETE RESULT:", data, error);

  if (error) {
    console.error("BULK DELETE ERROR:", error);
  
    if (error.code === '23503') {
      return res.status(400).send("Cannot delete: product used in invoices");
    }
  
    return res.status(500).send(error.message);
  }
  return res.status(200).json({ success: true });
}