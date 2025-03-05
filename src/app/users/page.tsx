"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
} from "@/components/ui/animated-modal"; // Adjust the import path as necessary
import { toast } from "react-toastify";

export default function UserPage() {
  const { data: users, isLoading } = api.users.getUsers.useQuery();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const updateUserRole = api.users.updateUser.useMutation();
  const { setOpen } = useModal();

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
        onSuccess: (data) => {
          toast.dismiss();
          setOpen(false);
          setSelectedUser(null);
          toast.success("User role updated successfully");
        },
        onError: (error) => {
          toast.dismiss();
          console.error("Failed to create account:", error);
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading users...</p>;
  }

  return (
    <div className="ml-80 mt-20 flex w-full flex-col gap-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Users</h1>
      {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"> */}
      {users?.data?.map((user) => (
        <Modal key={user.id}>
          <ModalTrigger>
            <div
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
              onClick={() => {
                setSelectedUser(user);
                setSelectedRole(user.role ?? "");
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.imageUrl ?? "https://placehold.co/150x150"}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex flex-col items-start">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Requested Role: {user.role ?? "None"}
                  </p>
                </div>
              </div>
            </div>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Role
              </h2>
              <p className="mt-2 text-gray-600">
                Assign a role to {selectedUser?.name}:
              </p>

              <select
                className="mt-4 w-full rounded-md border border-gray-300 p-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="WORKER">WORKER</option>
              </select>
            </ModalContent>
            <ModalFooter>
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-white ${
                    selectedRole
                      ? "bg-red-500 hover:bg-red-600"
                      : "cursor-not-allowed bg-gray-400"
                  }`}
                  onClick={handleAssignRole}
                  disabled={!selectedRole}
                >
                  Assign Role
                </button>
              </div>
            </ModalFooter>
          </ModalBody>
        </Modal>
      ))}
      {/* </div> */}
    </div>
  );
}
