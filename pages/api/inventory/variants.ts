import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { apiGuard } from '../../../lib/apiGuard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbUser = await apiGuard(req, res, 'inventory', 'view');

  if (!dbUser) return;

  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        variant_name,
        sku,
        products (
          name,
          is_active
        )
      `)
      .eq('client_id', dbUser.client_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const rows = (data || [])
      .filter((row: any) => row.products?.is_active === true)
      .map((row: any) => ({
        id: row.id,
        label:
          (row.products?.name || 'Product') +
          (row.variant_name ? ' - ' + row.variant_name : '') +
          (row.sku ? ' - ' + row.sku : '')
      }));

    return res.status(200).json(rows);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}