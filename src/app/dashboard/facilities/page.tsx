"use client";

import React, { useEffect, useState } from "react";
import { Pencil, PlusIcon, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ModalBody,
  ModalContent,
  useModal,
} from "@/components/ui/animated-modal";
import { toast } from "react-toastify";
import { api } from "@/trpc/react";

export default function FacilityScreen() {
  const { data: facilitiesData, isLoading } = api.groups.getGroupData.useQuery({
    groupType: "DEPARTMENT",
  });
  const [selectedFacility, setSelectedFacility] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { setOpen } = useModal();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const CreateFacility = api.groups.createGroup.useMutation();
  //   const UpdateFacility = api.groups.updateFacility.useMutation();
  const addUser = api.groups.addUserToGroup.useMutation();

  const { data: managers } = api.groups.getUnAssignedUsers.useQuery({
    role: "DEPARTMENT_MANAGER",
  });
  const { data: staff } = api.groups.getUnAssignedUsers.useQuery({
    role: "STAFF",
  });

  const [facilities, setFacility] = useState<Group[]>(
    facilitiesData?.data ?? [],
  );

  useEffect(() => {
    if (facilitiesData?.data) {
      setFacility(facilitiesData.data);
    }
  }, [facilitiesData]);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editMode && selectedFacility) {
      //   await UpdateFacility.mutateAsync(
      //     { id: selectedFacility.id, name, description },
      //     {
      //       onSuccess: (res) => {
      //         setFacility((prev) =>
      //           prev.map((d) =>
      //             d.id === selectedFacility.id ? { ...d, name, description } : d
      //           )
      //         );
      //         toast.success("Facility updated successfully");
      //         setEditMode(false);
      //         setName("");
      //         setDescription("");
      //       },
      //       onError: (err) => toast.error(err.message),
      //     }
      //   );
    } else {
      await CreateFacility.mutateAsync(
        { name, description, groupType: "DEPARTMENT" },
        {
          onSuccess: (data) => {
            if (data.data) {
              setFacility((prev) => [...prev, data.data]);
            }
            toast.success("Facility created successfully!");
            setName("");
            setDescription("");
            setShowCreateForm(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    }
  };

  const handleAssign = async (
    facilityId: string,
    userId: string,
    role: "MANAGER" | "STAFF",
  ) => {
    try {
      await addUser.mutateAsync({ groupId: facilityId, userIds: [userId] });
      toast.success(`${role} assigned`);
    } catch (error: unknown) {
      toast.error(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Error assigning user",
      );
    }
  };

  const handleMultipleAssign = async (
    facilityId: string,
    userIds: string[],
  ) => {
    try {
      await addUser.mutateAsync({ groupId: facilityId, userIds });
      toast.success("Staff assigned");
    } catch (error: unknown) {
      toast.error(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Error assigning staff",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="flex w-full items-center justify-between">
        <Button
          onClick={() => {
            setEditMode(false);
            setName("");
            setDescription("");
            setShowCreateForm((prev) => !prev);
          }}
          title="Create Facility"
          icon={<PlusIcon />}
        />
      </div>

      {showCreateForm && (
        <div className="w-full rounded-lg border bg-white p-6 shadow dark:bg-gray-800 dark:text-white">
          <Input
            type="text"
            label="Facility Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 rounded-lg p-2 shadow md:w-1/2"
          />
          <Label className="text-md mb-2 text-gray-500">
            Facility Description
          </Label>
          <textarea
            className="mb-4 min-h-28 w-full rounded-lg border bg-gray-50 p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enterfacility description"
          />
          <Button
            onClick={handleSubmit}
            title={editMode ? "Update Facility" : "Submit Facility"}
            loading={CreateFacility.isPending}
            // loading={CreateFacility.isPending || UpdateFacility.isPending}
          />
        </div>
      )}

      <div className="w-full space-y-6 p-6">
        {facilities.map((dept) => (
          <div
            key={dept.id}
            className="rounded-lg border bg-white p-6 shadow-md dark:bg-gray-800 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{dept.name}</h2>
              <div className="flex items-center gap-2">
                <Button
                  title="Assign Staff"
                  //   size="sm"
                  //   variant="ghost"
                  icon={<UserPlus size={16} />}
                  onClick={() => {
                    setSelectedFacility(dept);
                    setOpen(true);
                  }}
                />
                <Pencil
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                  size={18}
                  onClick={() => {
                    setEditMode(true);
                    setShowCreateForm(true);
                    setName(dept.name);
                    setDescription(dept.description);
                    setSelectedFacility(dept);
                  }}
                />
              </div>
            </div>
            <p className="line-clamp-2 text-gray-600 dark:text-gray-400">
              {dept.description}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Manager: {dept.manager?.name ?? "Not Assigned"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Staff Members: {dept.staff?.length ?? 0}
            </p>
          </div>
        ))}
      </div>

      <ModalBody className="mx-3 w-full overflow-y-auto">
        {selectedFacility && (
          <ModalContent className="w-full space-y-4">
            <h2 className="text-2xl font-bold dark:text-white">
              {selectedFacility.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedFacility.description}
            </p>

            <div>
              <Label className="text-sm">Assign Manager</Label>
              <select
                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                onChange={(e) =>
                  handleAssign(selectedFacility.id, e.target.value, "MANAGER")
                }
                value=""
              >
                <option value="">Select Manager</option>
                {managers?.data?.map((m: User) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm">Assign Staff</Label>
              <select
                multiple
                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                onChange={(e) =>
                  handleMultipleAssign(
                    selectedFacility.id,
                    Array.from(e.target.selectedOptions).map((o) => o.value),
                  )
                }
              >
                {staff?.data?.map((s: User) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </ModalContent>
        )}
      </ModalBody>
    </div>
  );
}
