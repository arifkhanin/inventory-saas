import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserContext } from "../../lib/getUserContext";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

const ACTIONS = ["view", "add", "update", "delete"];

export default function PermissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  const [module, setModule] = useState("");
  const [action, setAction] = useState("view");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const u = await requireAdmin(router);
      if (!u) return;
  
      setUser(u);
  
      await fetchPermissions(u.client_id); // ✅ REAL FUNCTION
    };
  
    init();
  }, []);

  const fetchPermissions = async (client_id: string) => {
    const { data } = await supabase
      .from("permissions")
      .select("*")
      .eq("client_id", client_id)
      .order("module");
  
    const perms = data || [];
    setPermissions(perms);
  
    // Extract unique modules
    const uniqueModules = [
      ...new Set(perms.map((p) => p.module.toLowerCase()))
    ];
  
    setModules(uniqueModules);
  };

  const handleSubmit = async () => {
    if (!module.trim() || !user) {
      alert("Module is required");
      return;
    }

    const normalizedModule = module.trim().toLowerCase();

    // Prevent duplicate (UI check)
    const exists = permissions.some(
      (p) =>
        p.module.trim().toLowerCase() === normalizedModule &&
        p.action === action
    );

    if (exists) {
      alert("Permission already exists");
      return;
    }
    
    console.log("USER CLIENT ID:", user.client_id);
    const { error } = await supabase
      .from("permissions")
      .insert({
        client_id: user.client_id,
        module: normalizedModule,
        action,
      });

      if (error) {
        if (error.code === "23505") {
          alert("Permission already exists");
        } else {
          alert("Error creating permission");
        }
        return;
      }

    setModule("");
    setAction("view");

    fetchPermissions(user.client_id);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Permissions</h1>

      {/* CREATE PERMISSION */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Create Permission</h2>

        <div className="flex gap-2">
        <div className="flex flex-col">
          <input
              list="modules"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="Module (e.g. products)"
              className="border p-2"
          />

          <datalist id="modules">
              {modules.map((m) => (
              <option key={m} value={m} />
              ))}
          </datalist>
        </div>

          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="border p-2"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* LIST PERMISSIONS */}
      <div>
        <h2 className="font-semibold mb-2">All Permissions</h2>

        {permissions.length === 0 && (
          <p className="text-gray-500 text-sm">
            No permissions yet
          </p>
        )}

        {permissions.map((p) => (
          <div
            key={p.id}
            className="border-b py-2"
          >
            {p.module}.{p.action}
          </div>
        ))}
      </div>
    </div>
  );
}