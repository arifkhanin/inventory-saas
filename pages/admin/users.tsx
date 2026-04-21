import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getUserContext } from "../../lib/getUserContext";
import { getPlanLimits } from "../../lib/planLimits";
import { useRouter } from "next/router";
import { requireAdmin } from "../../lib/requireAdmin";

export default function UsersPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [clientPlan, setClientPlan] = useState("basic");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const u = await requireAdmin(router);
      if (!u) return;
  
      setUser(u);
      fetchUsers(u.client_id);
      fetchClientPlan(u.client_id);
    };
  
    init();
  }, []);

  const fetchUsers = async (client_id: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("client_id", client_id);

    setUsers(data || []);
  };

  const fetchClientPlan = async (client_id: string) => {
    const { data } = await supabase
      .from("clients")
      .select("plan")
      .eq("id", client_id)
      .single();

    if (data) {
      setClientPlan(data.plan);
    }
  };

  const handleCreateUser = async () => {
    if (!name || !email || !user) {
      alert("Name and email required");
      return;
    }
  
    const limits = getPlanLimits(clientPlan);
  
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.client_id);
  
    if (count !== null && count >= limits.max_users) {
      alert("User limit reached for your plan");
      return;
    }
  
    // 🔥 NEW: call API instead of signUp
    const session = await supabase.auth.getSession();
  
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({
        name,
        email,
        client_id: user.client_id,
        branch_id: user.branch_id,
      }),
    });
  
    const result = await res.json();
  
    if (!res.ok) {
      alert(result.error);
      return;
    }
  
    alert("User created with default password: Default@1234");
  
    setName("");
    setEmail("");
  
    fetchUsers(user.client_id);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Users</h1>
        <p className="text-sm text-gray-500 mb-2">
          Plan: {clientPlan} (Max users: {getPlanLimits(clientPlan).max_users})
        </p>

      {/* CREATE USER */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Create User</h2>

        <div className="flex gap-2">
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2"
          />

          <button
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* LIST USERS */}
      <div>
        <h2 className="font-semibold mb-2">All Users</h2>

        {users.map((u) => (
          <div key={u.id} className="border-b py-2">
            {u.name} ({u.email}) - {u.role}
          </div>
        ))}
      </div>
    </div>
  );
}