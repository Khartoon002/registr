"use client";

import { useState, useMemo } from 'react';

interface Downline {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectName: string;
  packageName: string;
  registered: string; // ISO date string
}

export default function DownlinesTable({ initialData }: { initialData: Downline[] }) {
  const [query, setQuery] = useState<string>('');

  // Filter downlines based on query (name, phone, id, project, package)
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return initialData.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.id.toString().toLowerCase().includes(q) ||
      d.projectName.toLowerCase().includes(q) ||
      d.packageName.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q)
    );
  }, [initialData, query]);

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto p-2">
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, phone, ID, project, or package"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Downlines table */}
      <table className="min-w-full text-sm text-gray-200">
        <thead className="bg-gray-700 text-xs uppercase text-gray-300">
          <tr>
            <th className="text-left px-4 py-2">ID</th>
            <th className="text-left px-4 py-2">Name</th>
            <th className="text-left px-4 py-2">Phone</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Project</th>
            <th className="text-left px-4 py-2">Package</th>
            <th className="text-left px-4 py-2">Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No matching records found.</td>
            </tr>
          ) : (
            filtered.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-2">{d.id}</td>
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">{d.phone}</td>
                <td className="px-4 py-2">{d.email}</td>
                <td className="px-4 py-2">{d.projectName}</td>
                <td className="px-4 py-2">{d.packageName}</td>
                <td className="px-4 py-2">{new Date(d.registered).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
