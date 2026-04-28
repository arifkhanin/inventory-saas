import { supabase } from "../../../lib/supabase";
import { apiGuard } from "../../../lib/apiGuard";
import { applyTenantFilter } from "../../../lib/tenantQuery";

export default async function handler(req, res) {
  const { rows } = req.body;

  const dbUser = await apiGuard(
    req,
    res,
    "products",
    "add"
  );

  if (!dbUser) return;

  if (!rows || rows.length === 0) {
    return res.status(400).send("No data provided");
  }

  try {
    for (const row of rows) {
      /* ----------------------------
         Find existing product
      -----------------------------*/
      let existingQuery = supabase
        .from("products")
        .select("*")
        .eq("name", row.name);

      existingQuery =
        applyTenantFilter(
          existingQuery,
          dbUser
        );

      const {
        data: existing,
        error: fetchError,
      } =
        await existingQuery.maybeSingle();

      if (fetchError) {
        return res
          .status(500)
          .send(fetchError.message);
      }

      /* ----------------------------
         Existing product
      -----------------------------*/
      if (existing) {
        let updateQuery = supabase
          .from("products")
          .update({
            stock:
              Number(existing.stock || 0) +
              Number(row.stock || 0),

            low_stock_threshold:
              Number(
                row.threshold ||
                  existing.low_stock_threshold ||
                  10
              ),
          })
          .eq("id", existing.id);

        updateQuery =
          applyTenantFilter(
            updateQuery,
            dbUser
          );

        const { error: updateError } =
          await updateQuery;

        if (updateError) {
          console.error(
            "UPDATE ERROR:",
            updateError
          );

          return res
            .status(500)
            .send(updateError.message);
        }
      }

      /* ----------------------------
         New product
      -----------------------------*/
      else {
        const {
          error: insertError,
        } = await supabase
          .from("products")
          .insert([
            {
              name: row.name,
              price: Number(row.price),
              gst_rate: Number(
                row.gst_rate || 0
              ),
              stock: Number(
                row.stock || 0
              ),
              low_stock_threshold:
                Number(
                  row.threshold || 10
                ),

              client_id:
                dbUser.client_id,

              branch_id:
                dbUser.branch_id,
            },
          ]);

        if (insertError) {
          console.error(
            "INSERT ERROR:",
            insertError
          );

          return res
            .status(500)
            .send(insertError.message);
        }
      }
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Products saved",
      });
  } catch (err: any) {
    console.error(
      "ADD ERROR:",
      err
    );

    return res
      .status(500)
      .send(
        err.message ||
          "Error saving products"
      );
  }
}