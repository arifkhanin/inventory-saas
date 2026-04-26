import { fixInventory } from "../../../../lib/inventory/reconciliation/fixInventory";
import { getUserContext } from "../../../../lib/getUserContext";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await getUserContext(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔒 Admin only
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    const result = await fixInventory({
      client_id: user.client_id,
      branch_id: user.branch_id,
    });

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}