import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserContext } from "../../lib/getUserContext";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

export default function GroupPermissionsPage() {
  const [user, setUser] = useState<any>(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const [assigned, setAssigned] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const u = await requireAdmin(router);
      if (!u) return;
  
      setUser(u);
  
      // ✅ Load base data
      await fetchGroups(u.client_id);
      await fetchPermissions(u.client_id);
    };
  
    init();
  }, []);

  useEffect(() => {
    if (selectedGroup && permissions.length > 0) {
      loadGroupPermissions(selectedGroup);
    }
  }, [selectedGroup, permissions]);

  const fetchGroups = async (client_id: string) => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("client_id", client_id);

    setGroups(data || []);
  };

  const fetchPermissions = async (client_id: string) => {
    const { data } = await supabase
      .from("permissions")
      .select("*")
      .eq("client_id", client_id);

    setPermissions(data || []);
  };

  const loadGroupPermissions = async (group_id: string) => {
    const { data } = await supabase
      .from("group_permissions")
      .select("permission_id")
      .eq("group_id", group_id);

    const assignedIds = (data || []).map((d) => d.permission_id);

    const assignedPerms = permissions.filter((p) =>
      assignedIds.includes(p.id)
    );

    const availablePerms = permissions.filter(
      (p) => !assignedIds.includes(p.id)
    );

    setAssigned(assignedPerms);
    setAvailable(availablePerms);
  };

  const moveToAssigned = (perm: any) => {
    setAssigned([...assigned, perm]);
    setAvailable(available.filter((p) => p.id !== perm.id));
  };

  const moveToAvailable = (perm: any) => {
    setAvailable([...available, perm]);
    setAssigned(assigned.filter((p) => p.id !== perm.id));
  };

  const handleSave = async () => {
    if (!selectedGroup) return;

    // Delete existing
    await supabase
      .from("group_permissions")
      .delete()
      .eq("group_id", selectedGroup);

    // Insert new
    const inserts = assigned.map((p) => ({
      group_id: selectedGroup,
      permission_id: p.id,
    }));

    if (inserts.length > 0) {
      await supabase.from("group_permissions").insert(inserts);
    }

    alert("Saved successfully");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">
        Group Permissions
      </h1>

      {/* GROUP SELECT */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Select Group:</label>
        <select
          onChange={(e) => {
            setSelectedGroup(e.target.value);
          }}
          className="border p-2"
        >
          <option value="">-- Select --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* DUAL LIST */}
      {selectedGroup && (
        <div className="flex gap-6">
          {/* AVAILABLE */}
          <div className="w-1/2">
            <h2 className="font-semibold mb-2">
              Available Permissions
            </h2>

            <div className="border p-2 h-80 overflow-auto">
              {available.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>{p.module}.{p.action}</span>
                  <button
                    onClick={() => moveToAssigned(p)}
                    className="text-blue-600"
                  >
                    →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ASSIGNED */}
          <div className="w-1/2">
            <h2 className="font-semibold mb-2">
              Assigned Permissions
            </h2>

            <div className="border p-2 h-80 overflow-auto">
              {assigned.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>{p.module}.{p.action}</span>
                  <button
                    onClick={() => moveToAvailable(p)}
                    className="text-red-600"
                  >
                    ←
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAVE */}
      {selectedGroup && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}