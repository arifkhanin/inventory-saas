import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

export default function PermissionsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const u = await requireAdmin(router);
    if (!u) return;

    setUser(u);
    await fetchDefinitions();
  }

  async function fetchDefinitions() {
    const { data } = await supabase
      .from("permission_definitions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    const rows = data || [];
    setDefinitions(rows);

    if (rows.length > 0) {
      setSelectedId(rows[0].id);
    }
  }

  async function handleAdd() {
    setMessage(
      "Permissions are now managed through groups. Use Group Permissions page."
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        Permission Catalog
      </h1>

      {message && (
        <div className="mb-4 text-sm text-blue-700">
          {message}
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-semibold mb-3">
          Available Permissions
        </h2>

        {definitions.map((p) => (
          <div key={p.id} className="border-b py-2">
            <div className="font-mono">
              {p.code}
            </div>

            {p.label && (
              <div className="text-sm text-gray-500">
                {p.label}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Assign permissions to tenant groups from the Group Permissions page.
      </div>
    </div>
  );
}