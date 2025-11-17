"use client";

import UserLayout from '@/components/user/UserLayout';

export default function UserTransactionsPage() {
  return (
    <UserLayout>
      <section className="py-4">
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
          <h1 className="text-xl font-semibold text-gray-900">Transaction Packages</h1>
          <p className="text-gray-600 mt-1">Your recent purchases and payment history.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1,2,3].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">—</td>
                    <td className="px-4 py-2 text-sm text-gray-700">—</td>
                    <td className="px-4 py-2 text-sm text-gray-700">—</td>
                    <td className="px-4 py-2 text-sm"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
