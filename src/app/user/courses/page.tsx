"use client";

import UserLayout from "@/components/user/UserLayout";

export default function UserCoursesPage() {
  return (
    <UserLayout>
      <section className="py-4">
        <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20l9-5-9-5-9 5 9 5z M12 10l9-5-9-5-9 5 9 5z"
                />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-gray-900">
                Courses Enrolled
              </h1>
              <p className="text-gray-600 mt-1">
                The courses you have access to.
              </p>
              <div className="mt-4">
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <div className="text-sm text-gray-600">
                    No courses enrolled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
