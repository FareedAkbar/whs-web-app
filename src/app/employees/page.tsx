"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function EmployeePage() {
  const { data: employees, isLoading } = api.employees.getEmployees.useQuery();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading employees...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Employees</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {employees?.data?.map((employee: User) => (
          <div
            key={employee.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
            onClick={() => setSelectedEmployee(employee)}
          >
            <div className="flex items-center gap-4">
              <img
                src={employee.imageUrl}
                alt={employee.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {employee.name}
                </h2>
                <p className="text-sm text-gray-600">{employee.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {/* Created Incidents: {employee.incidents.length} */}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Employee Details */}
      {selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-4xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <img
                src={selectedEmployee.imageUrl}
                alt={selectedEmployee.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEmployee.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedEmployee.email}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Created Incidents
              </h3>
              <div className="space-y-4">
                {/* {selectedEmployee.incidents.map((incidentData, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {incidentData.incident.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {incidentData.incident.incidentType}
                        </p>
                      </div>
                      <p
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          incidentData.incidentReport.status === "OPEN"
                            ? "bg-yellow-200 text-yellow-800"
                            : incidentData.incidentReport.status === "RESOLVED"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {incidentData.incidentReport.status}
                      </p>
                    </div>
                    {incidentData.media.length > 0 && (
                      <img
                        src={incidentData.media[0].url}
                        alt="Incident Media"
                        className="mt-2 h-32 w-full rounded-md object-cover"
                      />
                    )}
                  </div>
                ))} */}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setSelectedEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
