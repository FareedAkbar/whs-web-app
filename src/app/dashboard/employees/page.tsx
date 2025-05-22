"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useModal } from "@/components/ui/animated-modal";
import { useSession } from "next-auth/react";
import Pagination from "@/app/_components/Pagination";

const EmployeePage = () => {
  const { data: employees, isLoading } = api.employees.getEmployees.useQuery();
  // const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (employees?.data) {
      setFilteredEmployees(employees.data);
    }
  }, [employees]);

  useEffect(() => {
    const result = employees?.data?.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredEmployees(result ?? []);
  }, [searchTerm, employees]);

  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden px-8">
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or email"
          className="my-2 w-full rounded-md border border-gray-300 px-2 py-3 text-sm shadow-sm dark:border-gray-500 dark:bg-gray-700 dark:text-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow dark:bg-gray-800">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Role</th>
              <th className="p-4 text-left font-medium">Status</th>
              {/* <th className="p-4 text-center font-medium text-gray-700">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((emp) => (
              <tr
                key={emp.id}
                className="border-t dark:border-gray-600 dark:text-white"
              >
                <td className="p-4">{emp.name}</td>
                <td className="p-4">{emp.email}</td>
                <td className="p-4">{emp.role}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      emp.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    {emp.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                {/* <td className="space-x-2 p-4 text-center">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setOpen(true);
                    }}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          totalItems={filteredEmployees.length}
          page={page}
          setPage={setPage}
        />
      </div>

      {/* <ModalBody>
        <ModalContent>
          <div className="flex flex-col items-center border-b pb-4">
            <img
              src={selectedEmployee?.imageUrl || "/default-avatar.png"}
              alt="Employee"
              className="h-24 w-24 rounded-full object-cover"
            />
            <h2 className="mt-4 text-lg font-semibold">
              {selectedEmployee?.name}
            </h2>
            <p className="text-sm text-gray-600">{selectedEmployee?.email}</p>
          </div>
        </ModalContent>
      </ModalBody> */}
    </div>
  );
};

export default EmployeePage;
