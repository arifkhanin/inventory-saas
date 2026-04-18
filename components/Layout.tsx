import React from 'react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
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
          <Link href="/add-product" className="hover:text-blue-500">Products</Link>
          <Link href="/record-sale">Sales</Link>
          <Link href="/report">Reports</Link>
          <Link href="/restock">Restock</Link>
          <Link href="/history">History</Link>
        </nav>      
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}