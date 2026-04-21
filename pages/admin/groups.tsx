import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getUserContext } from '../../lib/getUserContext';
import { useRouter } from 'next/router';
import { requireAdmin } from "../../lib/requireAdmin";

export default function GroupsPage() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const u = await requireAdmin(router);
      if (!u) return;
  
      setUser(u);
      fetchGroups(u.client_id);
    };
  
    init();
  }, []);

  const fetchGroups = async (client_id: string) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('client_id', client_id)
      .order('name');

    if (error) {
      console.error(error);
      return;
    }

    setGroups(data || []);
  };

  // ✅ CREATE GROUP
  const handleCreate = async () => {
    if (!newGroup.trim() || !user) return;

    // 🚫 Prevent duplicate at UI level
    const exists = groups.some(
      g => g.name.toLowerCase() === newGroup.toLowerCase()
    );

    if (exists) {
      alert('Group already exists');
      return;
    }

    const { error } = await supabase.from('groups').insert({
      name: newGroup,
      client_id: user.client_id
    });

    if (error) {
      console.error(error);
      alert('Error creating group');
      return;
    }

    setNewGroup('');
    fetchGroups(user.client_id);
  };

  // ✅ UPDATE GROUP
  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !user) return;

    const { error } = await supabase
      .from('groups')
      .update({ name: editName })
      .eq('id', id)
      .eq('client_id', user.client_id);

    if (error) {
      console.error(error);
      alert('Error updating group');
      return;
    }

    setEditingId(null);
    setEditName('');
    fetchGroups(user.client_id);
  };

  // ✅ DELETE GROUP
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Delete this group?');
    if (!confirmDelete || !user) return;

    // ⚠️ Optional: cleanup relations
    await supabase.from('group_permissions').delete().eq('group_id', id);
    await supabase.from('user_groups').delete().eq('group_id', id);

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)
      .eq('client_id', user.client_id);

    if (error) {
      console.error(error);
      alert('Error deleting group');
      return;
    }

    fetchGroups(user.client_id);
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Groups</h1>

      {/* CREATE */}
      <div className="flex gap-2 mb-4">
        <input
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          placeholder="New group name"
          className="border p-2 flex-1"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4"
        >
          Create
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            {editingId === g.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1 flex-1 mr-2"
                />
                <button
                  onClick={() => handleUpdate(g.id)}
                  className="bg-green-500 text-white px-2 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-300 px-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>{g.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(g.id);
                      setEditName(g.name);
                    }}
                    className="bg-yellow-400 px-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="bg-red-500 text-white px-2"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}