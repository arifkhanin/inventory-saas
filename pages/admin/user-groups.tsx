import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserContext } from "../../lib/getUserContext";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

export default function UserGroupsPage() {
  const [user, setUser] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [assigned, setAssigned] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const u = await requireAdmin(router);
      if (!u) return;
  
      setUser(u);
  
      // ✅ Load base data
      await fetchUsers(u.client_id);
      await fetchGroups(u.client_id);
    };
  
    init();
  }, []);

  useEffect(() => {
    if (selectedUser && groups.length > 0) {
      loadUserGroups(selectedUser);
    }
  }, [selectedUser, groups]);

  const fetchUsers = async (client_id: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("client_id", client_id);

    setUsers(data || []);
  };

  const fetchGroups = async (client_id: string) => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .eq("client_id", client_id);

    setGroups(data || []);
  };

  const loadUserGroups = async (user_id: string) => {
    const { data } = await supabase
      .from("user_groups")
      .select("group_id")
      .eq("user_id", user_id);

    const assignedIds = (data || []).map((d) => d.group_id);

    const assignedGroups = groups.filter((g) =>
      assignedIds.includes(g.id)
    );

    const availableGroups = groups.filter(
      (g) => !assignedIds.includes(g.id)
    );

    setAssigned(assignedGroups);
    setAvailable(availableGroups);
  };

  const moveToAssigned = (group: any) => {
    setAssigned([...assigned, group]);
    setAvailable(available.filter((g) => g.id !== group.id));
  };

  const moveToAvailable = (group: any) => {
    setAvailable([...available, group]);
    setAssigned(assigned.filter((g) => g.id !== group.id));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    // delete existing
    await supabase
      .from("user_groups")
      .delete()
      .eq("user_id", selectedUser);

    // insert new
    const inserts = assigned.map((g) => ({
      user_id: selectedUser,
      group_id: g.id,
    }));

    if (inserts.length > 0) {
      await supabase.from("user_groups").insert(inserts);
    }

    alert("Saved successfully");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">
        User Groups
      </h1>

      {/* USER SELECT */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Select User:</label>
        <select
          onChange={(e) => {
            const userId = e.target.value;
            setSelectedUser(userId);
            // loadUserGroups(userId);
          }}
          className="border p-2"
        >
          <option value="">-- Select --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* DUAL LIST */}
      {selectedUser && (
        <div className="flex gap-6">
          {/* AVAILABLE */}
          <div className="w-1/2">
            <h2 className="font-semibold mb-2">
              Available Groups
            </h2>

            <div className="border p-2 h-80 overflow-auto">
              {available.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>{g.name}</span>
                  <button
                    onClick={() => moveToAssigned(g)}
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
              Assigned Groups
            </h2>

            <div className="border p-2 h-80 overflow-auto">
              {assigned.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between items-center border-b py-1"
                >
                  <span>{g.name}</span>
                  <button
                    onClick={() => moveToAvailable(g)}
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
      {selectedUser && (
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