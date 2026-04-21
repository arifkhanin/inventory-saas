import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserContext } from '../lib/getUserContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await getUserContext();
      setUser(u);
    };

    loadUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4">
        <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
          Inventory
        </h1>

        <nav className="flex flex-col gap-3">
          <Link href="/">Dashboard</Link>
          <Link href="/add-customer">Customer</Link>
          <Link href="/add-product">Products</Link>
          <Link href="/record-sale">Sales</Link>
          <Link href="/report">Reports</Link>
          <Link href="/restock">Restock</Link>
          <Link href="/history">History</Link>

          {/* ADMIN SECTION */}
          {user?.role === 'super_user' && (
            <div className="mt-6 border-t pt-4">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                Admin
              </h2>

              <div className="flex flex-col gap-2">
                <Link href="/admin/users">Users</Link>
                <Link href="/admin/groups">Groups</Link>
                <Link href="/admin/permissions">Permissions</Link>
                <Link href="/admin/group-permissions">Group Permissions</Link>
                <Link href="/admin/user-groups">User Groups</Link>
              </div>
            </div>
          )}
      </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}