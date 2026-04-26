import { supabase } from '../../../lib/supabase';
import { canUser } from '../../../lib/permissions';
import { apiGuard } from '../../../lib/apiGuard';
import { applyTenantFilter } from '../../../lib/tenantQuery';

export default async function handler(req, res) {
  const { rows } = req.body;

  const dbUser = await apiGuard(req, res, 'products', 'add');
  
  if (!dbUser) return;

  if (!rows || rows.length === 0) {
    return res.status(400).send("No data provided");
  }

  try {
    for (const row of rows) {
      // 🔍 Check existing product
      let existingQuery = supabase
        .from('products')
        .select('*')
        .eq('name', row.name);

      existingQuery = applyTenantFilter(existingQuery, dbUser);

      const { data: existing, error: fetchError } = await existingQuery.maybeSingle();

      if (fetchError) {
        return res.status(500).send(fetchError.message);
      }

      if (existing) {
        // 🔄 Update stock
        let updateQuery = supabase
          .from('products')
          .update({
            stock: existing.stock + Number(row.stock),
            low_stock_threshold: Number(
              row.threshold || existing.low_stock_threshold || 10
            )
          })
          .eq('id', existing.id);

        updateQuery = applyTenantFilter(updateQuery, dbUser);

        await updateQuery;
      } else {
        // ➕ Insert new product
        await supabase.from('products').insert([{
          name: row.name,
          price: Number(row.price),
          gst_rate: Number(row.gst_rate),
          stock: Number(row.stock),
          low_stock_threshold: Number(row.threshold || 10),
          client_id: dbUser.client_id,
          branch_id: dbUser.branch_id
        }]);
      }
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("ADD ERROR:", err);
    return res.status(500).send("Error saving products");
  }
}