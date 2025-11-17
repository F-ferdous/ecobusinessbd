"use client";

import UserLayout from '@/components/user/UserLayout';

export default function UserCoursesPage() {
  return (
    <UserLayout>
      <section className="py-4">
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
          <h1 className="text-xl font-semibold text-gray-900">Courses Enrolled</h1>
          <p className="text-gray-600 mt-1">The courses you have access to.</p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-5 ring-1 ring-gray-100 hover:bg-gray-100 transition">
                <div className="text-sm text-gray-500">Course</div>
                <div className="text-lg font-semibold text-gray-900">Placeholder {i}</div>
                <div className="mt-2 text-sm text-gray-600">—</div>
                <div className="mt-3">
                  <button className="text-white bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 py-1 text-sm">Continue</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
