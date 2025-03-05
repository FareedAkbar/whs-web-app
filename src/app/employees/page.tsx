"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function EmployeePage() {
  const { data: employees, isLoading } = api.employees.getEmployees.useQuery();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="ml-80 mt-20 flex w-full flex-col gap-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Employees</h1>
      {employees?.data?.map((employee: User) => (
        <div
          key={employee.id}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
          // onClick={() => setSelectedEmployee(employee)}
        >
          <div className="flex gap-4">
            <img
              src={employee.imageUrl ?? "https://placehold.co/150x150"}
              alt={employee.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex flex-col items-start">
              <h2 className="text-lg font-semibold capitalize text-gray-800">
                {employee.name}
              </h2>
              <p className="text-sm text-gray-600">{employee.email}</p>
              <p className="text-sm text-gray-500">
                Role: {employee.role ?? "None"}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Modal for Employee Details */}
    </div>
  );
}
