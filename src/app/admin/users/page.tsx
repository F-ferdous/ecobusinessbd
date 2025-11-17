"use client";

import { useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";

interface UserItem {
  id: string;
  email: string;
  displayName?: string;
  Role?: string;
  country?: string;
  mobileNumber?: string;
  createdAt?: Timestamp;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mock: UserItem[] = [
      { id: "u1", email: "admin@ecobusiness.com", displayName: "Admin", Role: "admin", country: "United States", mobileNumber: "+1 555-1111", createdAt: Timestamp.now() as unknown as Timestamp },
      { id: "u2", email: "jane@example.com", displayName: "Jane Doe", Role: "client", country: "United Kingdom", mobileNumber: "+44 7700 900000", createdAt: Timestamp.now() as unknown as Timestamp },
    ];
    setUsers(mock);
    setLoading(false);
  }, []);

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
            <p className="text-gray-600">View all user accounts and details.</p>
          </div>

          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="overflow-x-auto bg-gray-50 rounded-2xl shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.displayName || "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {u.Role || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.country || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{u.mobileNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}
