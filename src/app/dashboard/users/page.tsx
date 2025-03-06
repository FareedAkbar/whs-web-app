"use client";

import { Suspense, useState } from "react";
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

const UserPage = () => {
  const { data: users, isLoading, refetch } = api.users.getUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const updateUserRole = api.users.updateUser.useMutation();
  const { setOpen } = useModal();
  const [filter, setFilter] = useState("all"); // New filter state

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    const isSameRole = selectedRole === selectedUser.role;

    await updateUserRole.mutateAsync(
      {
        id: selectedUser.id,
        ...(isSameRole ? {} : { role: selectedRole }),
        isVerifiedByAdmin: true,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          setSelectedUser(null);
          toast.success("User role updated successfully");
          refetch();
        },
        onError: (error) => {
          toast.dismiss();
          console.error("Failed to update user role:", error);
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
    setOpen(false);
  };
  // Filter users based on selected filter
  const filteredUsers = users?.data?.filter((user) => {
    if (filter === "approved") return user.isVerifiedByAdmin;
    if (filter === "pending") return !user.isVerifiedByAdmin;
    return true; // "all" case
  });
  if (isLoading) {
    return (
      <div className="relative flex h-[90vh] w-[80vw] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 overflow-hidden px-8">
      <div className="mb-4 flex items-center justify-end">
        <select
          className="my-2 rounded-md border border-gray-300 p-2 text-sm shadow-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      {/* Scrollable Card Container */}
      <div className="custom-scrollbar flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
        {filteredUsers?.map((user) => (
          <div
            className="my-2 cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-md transition-all hover:border-gray-300 hover:shadow-lg"
            onClick={() => {
              setSelectedUser(user);
              setSelectedRole(user.role ?? "");
              setOpen(true);
            }}
          >
            <div className="flex items-center justify-between">
              {/* User Details */}
              <div className="items- flex gap-4">
                <img
                  src={
                    user.providerImageUrl !== ""
                      ? user.providerImageUrl
                      : "https://placehold.co/150x150"
                  }
                  alt={user.name}
                  className="h-12 w-12 rounded-full border border-gray-300 object-cover"
                />
                <div className="flex flex-col items-start">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Role:{" "}
                    <span className="font-medium">{user.role ?? "None"}</span>
                  </p>
                </div>
              </div>

              {/* Verification Status */}
              <div
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  user.isVerifiedByAdmin
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current"></span>
                {user.isVerifiedByAdmin ? "Approved" : "Approval Pending"}
              </div>
            </div>
          </div>
        ))}
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
              ) : (
                <IconRosetteDiscountCheckOff
                  className="text-red-600"
                  size={20}
                  title="Not Verified"
                />
              )}
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
            <option value="WORKER">WORKER</option>
          </select>
        </ModalContent>

        <ModalFooter>
          <div className="flex justify-end gap-2">
            {/* Assign Role or Approve & Assign */}
            {selectedUser?.isVerified ? (
              <button
                className={`rounded-md px-4 py-2 text-white ${
                  selectedRole
                    ? "bg-red-500 hover:bg-red-600"
                    : "cursor-not-allowed bg-gray-400"
                }`}
                onClick={handleAssignRole}
                disabled={!selectedRole}
              >
                {selectedUser?.isVerifiedByAdmin
                  ? "Change Role"
                  : "Approve & Assign Role"}
              </button>
            ) : (
              <button
                className="cursor-not-allowed rounded-md bg-gray-400 px-4 py-2 text-white"
                disabled
              >
                Cannot Assign Role
              </button>
            )}
          </div>
        </ModalFooter>
      </ModalBody>

      {/* </div> */}
    </div>
  );
};

export default UserPage;
