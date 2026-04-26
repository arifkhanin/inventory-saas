import { validateInventory } from "../../../../lib/inventory/reconciliation/validateInventory";
import { getUserContext } from "../../../../lib/getUserContext";
import { canUser } from "../../../../lib/canUser";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 🧠 1. Get user
    const user = await getUserContext(req);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 🔒 2. Admin check (IMPORTANT)
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    // 🔍 3. Validate inventory
    const result = await validateInventory({
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