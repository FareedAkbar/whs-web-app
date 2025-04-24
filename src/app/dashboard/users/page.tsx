"use client";

import { Suspense, useEffect, useState } from "react";
import { api } from "@/trpc/react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
  ModalProvider,
} from "@/components/ui/animated-modal"; // Adjust the import path as necessary
import { toast } from "react-toastify";
import {
  IconCheck,
  IconRosetteDiscountCheckFilled,
  IconRosetteDiscountCheckOff,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import Dropdown from "@/components/ui/Dropdown";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { set } from "zod";
import Pagination from "@/app/_components/Pagination";

const UserPage = () => {
  const { data: users, isLoading, refetch } = api.users.getUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const updateUserRole = api.users.adminUpdateUserRole.useMutation();
  const [loading, setLoading] = useState(false);
  const { setOpen } = useModal();
  const [adminVerificationFilter, setAdminVerificationFilter] = useState("all");
  const [selfVerificationFilter, setSelfVerificationFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    if (users?.data) {
      setFilteredUsers(users.data); // initially show all users
    }
  }, [users]);
  const applyFilters = () => {
    const result = users?.data?.filter((user) => {
      const matchesAdmin =
        adminVerificationFilter === "all" ||
        (adminVerificationFilter === "approved" && user.isVerifiedByAdmin) ||
        (adminVerificationFilter === "pending" && !user.isVerifiedByAdmin);

      const matchesSelf =
        selfVerificationFilter === "all" ||
        (selfVerificationFilter === "verified" && user.isVerified) ||
        (selfVerificationFilter === "unverified" && !user.isVerified);

      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesAdmin && matchesSelf && matchesSearch;
    });

    setFilteredUsers(result || []);
    setIsFilterOpen(false);
  };
  useEffect(() => {
    applyFilters();
  }, [searchTerm]);
  useEffect(() => {
    setSelectedRole(selectedUser?.role ?? "");
  }, [selectedUser]);
  const session = useSession();
  const handleAssignRole = async () => {
    if (!selectedUser) return;
    setLoading(true);
    const isSameRole = selectedRole === selectedUser.role;

    await updateUserRole.mutateAsync(
      {
        id: selectedUser.id,
        ...(isSameRole ? {} : { role: selectedRole }),
        isVerifiedByAdmin: true,
      },
      {
        async onSuccess() {
          toast.dismiss();
          setSelectedUser(null);
          toast.success("User role updated successfully");
          await refetch();
        },
        onError: (error) => {
          toast.dismiss();
          console.error("Failed to update user role:", error);
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
    setLoading(false);
    setOpen(false);
  };
  const handleClearFilter = () => {
    setAdminVerificationFilter("all");
    setSelfVerificationFilter("all");
    setSearchTerm("");
    setFilteredUsers(users?.data || []);
    setIsFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow- flex w-full flex-col px-8">
      <div className="mb-4 flex h-full items-center justify-between">
        <input
          type="text"
          placeholder="Search by name or email"
          className="my-2 w-full rounded-l-md border border-gray-300 px-2 py-3 text-sm shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dropdown
          button={
            <button className="flex w-full flex-row items-center border border-gray-300 bg-[#F9F9F9] px-4 py-3 text-sm">
              Filters
              <ChevronDown className="ml-2 inline" size={16} />
            </button>
          }
          className="absolute right-0 z-50"
          dropdownClassName="min-w-72"
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
        >
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            <p className="border-b pb-2 font-bold">Filter</p>
            {/* Date Range */}
            {/* <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-1/2 rounded border border-gray-300 px-2 py-1"
                      />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-1/2 rounded border border-gray-300 px-2 py-1"
                      />
                    </div>
                  </div> */}

            {/* Assigned Person */}
            {session.data?.user?.role == "ADMIN" && (
              <div>
                <Select
                  options={[
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                  ]}
                  value={adminVerificationFilter}
                  onChange={(e) => {
                    setAdminVerificationFilter(e.target.value);
                  }}
                  label="Admin Verification"
                />
              </div>
            )}
            {session.data?.user?.role == "ADMIN" && (
              <div>
                <Select
                  options={[
                    { value: "all", label: "All" },
                    { value: "unverified", label: "Unverified" },
                    { value: "verified", label: "Verified" },
                  ]}
                  value={selfVerificationFilter}
                  onChange={(e) => {
                    setSelfVerificationFilter(e.target.value);
                  }}
                  label="Self Verification"
                />
              </div>
            )}

            {/* Filter Buttons */}
            <Button
              onClick={applyFilters}
              title="Apply Filters"
              icon={<Filter size={16} />}
            />
            <Button
              title="Clear Filters"
              onClick={handleClearFilter}
              variant="secondary"
            />
          </div>
        </Dropdown>
        <div className="rounded-r-md bg-primary p-[15px]">
          <Search className="" size={16} color="white" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50">
            <tr>
              {/* <th className="w-10 p-4">
                <input type="checkbox" className="accent-primary" />
              </th> */}
              <th className="p-4 text-left font-medium text-gray-700">Name</th>
              <th className="p-4 text-left font-medium text-gray-700">Email</th>
              <th className="p-4 text-left font-medium text-gray-700">Role</th>
              <th className="p-4 text-left font-medium text-gray-700">
                Status
              </th>
              <th className="p-4 text-center font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-t">
                {/* <td className="p-4 text-center">
                  <input type="checkbox" className="accent-primary" />
                </td> */}
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {user.role === "WORKER" ? "CONTRACTOR" : user.role}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${user.isVerifiedByAdmin ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    {user.isVerifiedByAdmin ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="space-x-2 p-4 text-center">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setSelectedUser(user);
                      setOpen(true);
                    }}
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  {/* <button
              className="text-green-600 hover:text-green-800"
              onClick={() => {
                setSelectedUser(user);
                setSelectedRole(user.role ?? "");
                setOpen(true);
              }}
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => handleDeleteUser(user.id)}
              title="Delete"
            >
              <Trash size={18} />
            </button> */}
                </td>
              </tr>
            ))}
            {/* {paginatedUsers} */}
          </tbody>
        </table>
        <Pagination data={filteredUsers} page={page} setPage={setPage} />
      </div>

      <ModalBody>
        <ModalContent>
          <div className="flex flex-col items-center border-b pb-4">
            <img
              src={
                selectedUser?.providerImageUrl !== ""
                  ? selectedUser?.providerImageUrl
                  : "https://placehold.co/150x150"
              }
              alt={selectedUser?.name}
              className="h-20 w-20 rounded-full border border-gray-300 object-cover"
            />
            <h2 className="mt-3 flex items-center gap-1 text-xl font-semibold text-gray-900">
              {selectedUser?.name}
              {selectedUser?.isVerified ? (
                <IconRosetteDiscountCheckFilled
                  className="text-green-600"
                  size={20}
                />
              ) : null}
            </h2>
            <p className="text-sm text-gray-600">{selectedUser?.email}</p>
          </div>

          {/* Verification Status Messages */}
          <div className="flex items-center justify-center">
            {selectedUser?.isVerifiedByAdmin ? (
              <p className="mt-4 w-fit rounded-md bg-green-100 px-3 py-1 text-center text-sm font-medium text-green-600">
                ✅ Role Approved
              </p>
            ) : (
              <p className="mt-4 rounded-md bg-yellow-100 px-3 py-1 text-center text-sm font-medium text-yellow-600">
                ⚠️ Pending Approval
              </p>
            )}
          </div>
          {/* Role Selection */}
          <label className="mt-6 block text-sm font-medium text-gray-700">
            Select Role:
          </label>
          <select
            className="mt-2 w-full rounded-md border border-gray-300 p-2 disabled:cursor-not-allowed disabled:bg-gray-200"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={!selectedUser?.isVerified}
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="WORKER">CONTRACTOR</option>
          </select>
        </ModalContent>

        <ModalFooter>
          <div className="flex justify-end gap-2">
            {/* Assign Role or Approve & Assign */}
            {selectedUser?.isVerified ? (
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRole}
                loading={loading}
                title={
                  selectedUser?.isVerifiedByAdmin
                    ? "Change Role"
                    : "Approve & Assign Role"
                }
              />
            ) : (
              // <button
              //   className={`rounded-md px-4 py-2 text-white ${
              //     selectedRole
              //       ? "bg-red-500 hover:bg-red-600"
              //       : "cursor-not-allowed bg-gray-400"
              //   }`}
              //   onClick={handleAssignRole}
              //   disabled={!selectedRole}
              // >
              //   {selectedUser?.isVerifiedByAdmin
              //     ? "Change Role"
              //     : "Approve & Assign Role"}
              // </button>
              // <button
              //   className="cursor-not-allowed rounded-md bg-gray-400 px-4 py-2 text-white"
              //   disabled
              // >
              //   Cannot Assign Role
              // </button>
              <Button title="Cannot Assign Role" disabled loading={loading} />
            )}
          </div>
        </ModalFooter>
      </ModalBody>
    </div>
  );
};

export default UserPage;
