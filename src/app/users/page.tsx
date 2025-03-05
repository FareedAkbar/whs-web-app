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
  const { data: users, isLoading, refetch } = api.users.getUsers.useQuery();
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
        onSuccess: () => {
          toast.dismiss();
          setOpen(false);
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
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="ml-80 mt-20 flex w-full flex-col gap-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Users</h1>
      {/* <div> */}
      {users?.data?.map((user) => (
        <Modal key={user.id}>
          <ModalTrigger>
            <div
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-md transition-all hover:border-gray-300 hover:shadow-lg"
              onClick={() => {
                setSelectedUser(user);
                setSelectedRole(user.role ?? "");
              }}
            >
              <div className="flex items-center justify-between">
                {/* User Details */}
                <div className="items- flex gap-4">
                  <img
                    src={user.imageUrl ?? "https://placehold.co/150x150"}
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
                  {user.isVerifiedByAdmin
                    ? "Verified"
                    : "Verification Required"}
                </div>
              </div>
            </div>
          </ModalTrigger>

          <ModalBody>
            <ModalContent>
              {/* User Info Section */}
              <div className="flex flex-col items-center border-b pb-4">
                <img
                  src={selectedUser?.imageUrl ?? "https://placehold.co/100x100"}
                  alt={selectedUser?.name}
                  className="h-20 w-20 rounded-full border border-gray-300 object-cover"
                />
                <h2 className="mt-3 text-xl font-semibold text-gray-900">
                  {selectedUser?.name}
                </h2>
                <p className="text-sm text-gray-600">{selectedUser?.email}</p>
              </div>

              {/* Verification Status Messages */}
              <div className="flex items-center justify-center">
                {selectedUser?.isVerified ? (
                  selectedUser?.isVerifiedByAdmin ? (
                    <p className="mt-4 w-fit rounded-md bg-green-100 px-3 py-1 text-center text-sm font-medium text-green-600">
                      ✅ You can change their role.
                    </p>
                  ) : (
                    <p className="mt-4 rounded-md bg-yellow-100 px-3 py-1 text-center text-sm font-medium text-yellow-600">
                      ⚠️ User verified themselves. Approve and assign a role.
                    </p>
                  )
                ) : (
                  <p className="mt-4 rounded-md bg-red-100 px-3 py-1 text-center text-sm font-medium text-red-600">
                    ❌ User has not verified themselves.
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
                <button
                  className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>

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
        </Modal>
      ))}

      {/* </div> */}
    </div>
  );
}
