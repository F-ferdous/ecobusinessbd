"use client";

import React from "react";

export default function AdminAmazonCoursesPage() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Amazon Course Management</h1>
          <p className="text-gray-600">Create, edit and manage Amazon courses.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["Create Course", "Manage Modules", "Enrollments"].map((title, i) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6 shadow animate-fadeInUp" style={{animationDelay: `${i*100}ms`}}>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
