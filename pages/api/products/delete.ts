import { supabase } from '../../../lib/supabase';
import { apiGuard } from '../../../lib/apiGuard';
import { applyTenantFilter } from '../../../lib/tenantQuery';

export default async function handler(req, res) {
  const { id } = req.body;

  const dbUser = await apiGuard(req, res, 'products', 'delete');
  if (!dbUser) return;

  if (!id) {
    return res.status(400).send("Missing ID");
  }

  let query = supabase
  .from('products')
  .delete()
  .eq('id', id)
  
  query = applyTenantFilter(query, dbUser);
  const { data, error } = await query.select();

  if (error) {
    return res.status(500).send(error.message);
  }

  return res.status(200).json({ success: true });
}