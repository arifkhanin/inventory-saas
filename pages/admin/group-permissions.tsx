import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

export default function GroupPermissionsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const [assigned, setAssigned] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const u = await requireAdmin(router);

    if (!u) return;

    setUser(u);

    await Promise.all([
      fetchGroups(u.client_id),
      fetchDefinitions(),
    ]);
  }

  async function fetchGroups(clientId: string) {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("client_id", clientId)
      .order("name");

    setGroups(data || []);
  }

  async function fetchDefinitions() {
    const { data } = await supabase
      .from("permission_definitions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    setDefinitions(data || []);
  }

  async function loadGroupPermissions(groupId: string) {
    const { data } = await supabase
      .from("group_permissions")
      .select("permission_id")
      .eq("group_id", groupId);

    const assignedIds = (data || []).map(
      (x: any) => x.permission_id
    );

    const assignedRows = definitions.filter((d) =>
      assignedIds.includes(d.id)
    );

    const availableRows = definitions.filter(
      (d) => !assignedIds.includes(d.id)
    );

    setAssigned(assignedRows);
    setAvailable(availableRows);
  }

  function moveToAssigned(row: any) {
    setAssigned([...assigned, row]);

    setAvailable(
      available.filter((x) => x.id !== row.id)
    );
  }

  function moveToAvailable(row: any) {
    setAvailable([...available, row]);

    setAssigned(
      assigned.filter((x) => x.id !== row.id)
    );
  }

  async function handleSave() {
    if (!selectedGroup) return;

    setSaving(true);
    setMessage("");

    await supabase
      .from("group_permissions")
      .delete()
      .eq("group_id", selectedGroup);

    const rows = assigned.map((a) => ({
      group_id: selectedGroup,
      permission_id: a.id,
    }));

    if (rows.length > 0) {
      await supabase
        .from("group_permissions")
        .insert(rows);
    }

    setSaving(false);
    setMessage("Permissions saved");
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">
        Group Permissions
      </h1>

      {message && (
        <div className="mb-4 text-blue-700 text-sm">
          {message}
        </div>
      )}

      {/* GROUP SELECT */}
      <div className="mb-6">
        <label className="font-semibold mr-2">
          Select Group:
        </label>

        <select
          value={selectedGroup}
          onChange={async (e) => {
            const id = e.target.value;

            setSelectedGroup(id);

            if (id) {
              await loadGroupPermissions(id);
            } else {
              setAssigned([]);
              setAvailable([]);
            }
          }}
          className="border p-2"
        >
          <option value="">
            -- Select Group --
          </option>

          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* LISTS */}
      {selectedGroup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* AVAILABLE */}
          <div>
            <h2 className="font-semibold mb-2">
              Available Permissions
            </h2>

            <div className="border p-2 h-96 overflow-auto rounded">
              {available.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span className="font-mono text-sm">
                    {p.code}
                  </span>

                  {p.label && (
                    <span className="text-gray-500 text-xs ml-2">
                      ({p.label})
                    </span>
                  )}

                  <button
                    onClick={() =>
                      moveToAssigned(p)
                    }
                    className="text-blue-600"
                  >
                    →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ASSIGNED */}
          <div>
            <h2 className="font-semibold mb-2">
              Assigned Permissions
            </h2>

            <div className="border p-2 h-96 overflow-auto rounded">
              {assigned.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span className="font-mono text-sm">
                    {p.code}
                  </span>

                  {p.label && (
                    <span className="text-gray-500 text-xs ml-2">
                      ({p.label})
                    </span>
                  )}

                  <button
                    onClick={() =>
                      moveToAvailable(p)
                    }
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
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}