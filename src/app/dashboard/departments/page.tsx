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
import { User } from "@/types/user";

export default function DepartmentsScreen() {
  const { data: departmentsData, isLoading } = api.groups.getGroupData.useQuery(
    { groupType: "DEPARTMENT" },
  );
  const [departments, setDepartments] = useState<Group[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Group | null>(
    null,
  );
  const [modalType, setModalType] = useState<
    "assign" | "changeManager" | "updateStaff" | null
  >(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState<User[]>([]);

  const [selectedManager, setSelectedManager] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [currentStaff, setCurrentStaff] = useState<string[]>([]);

  const { setOpen } = useModal();

  const CreateDepartment = api.groups.createGroup.useMutation();
  const addUser = api.groups.addUserToGroup.useMutation();
  const { data: managers } = api.groups.getUnAssignedUsers.useQuery({
    role: "DEPARTMENT_MANAGER",
  });
  const { data: staff } = api.groups.getUnAssignedUsers.useQuery({
    role: "STAFF",
  });

  useEffect(() => {
    if (departmentsData?.data) setDepartments(departmentsData.data);
  }, [departmentsData]);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editMode && selectedDepartment) {
      toast.info("Edit functionality not implemented yet");
      // implement update mutation here
    } else {
      await CreateDepartment.mutateAsync(
        { name, description, groupType: "DEPARTMENT" },
        {
          onSuccess: (data) => {
            if (data.data) {
              setDepartments((prev) => [...prev, data.data]);
            }
            toast.success("Department created successfully!");
            setName("");
            setDescription("");
            setShowCreateForm(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
    }
  };

  const handleFinalAssign = async () => {
    if (!selectedDepartment) return;
    const allIds = [selectedManager, ...selectedStaff].filter(Boolean);

    try {
      await addUser.mutateAsync({
        groupId: selectedDepartment.id,
        userIds: allIds,
      });
      toast.success("Manager and Staff assigned");
      setOpen(false);
      setModalType(null);
    } catch (error: any) {
      toast.error(error.message || "Assigning failed");
    }
  };

  const handleChangeManager = async () => {
    if (!selectedDepartment || !selectedManager) return;
    try {
      await addUser.mutateAsync({
        groupId: selectedDepartment.id,
        userIds: [selectedManager],
      });
      toast.success("Manager updated");
      setOpen(false);
      setModalType(null);
    } catch (error: any) {
      toast.error(error.message || "Updating manager failed");
    }
  };

  const handleUpdateStaff = async () => {
    if (!selectedDepartment || selectedStaff.length === 0) return;
    try {
      await addUser.mutateAsync({
        groupId: selectedDepartment.id,
        userIds: selectedStaff,
      });
      toast.success("Staff updated");
      setOpen(false);
      setModalType(null);
    } catch (error: any) {
      toast.error(error.message || "Updating staff failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-2/3 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="flex w-full items-center justify-end">
        <Button
          onClick={() => {
            setEditMode(false);
            setName("");
            setDescription("");
            setShowCreateForm((prev) => !prev);
          }}
          title="Create Department"
          icon={<PlusIcon />}
        />
      </div>

      {showCreateForm && (
        <div className="w-full rounded-lg border bg-white p-6 shadow dark:border-gray-500 dark:bg-gray-800 dark:text-white">
          <Input
            type="text"
            label="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 rounded-lg p-2 shadow md:w-1/2"
          />
          <Label className="mb-2 text-gray-500">Department Description</Label>
          <textarea
            className="mb-4 min-h-28 w-full rounded-lg border bg-gray-50 p-2 shadow dark:bg-gray-700 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter department description"
          />
          <div className="flex gap-4">
            <Button
              title={editMode ? "Update Department" : "Submit Department"}
              onClick={handleSubmit}
              loading={CreateDepartment.isPending}
            />
            <Button
              title="Discard"
              variant="secondary"
              onClick={() => {
                // if (editMode || name || description) {
                //   const confirm = window.confirm("Discard changes?");
                //   if (!confirm) return;
                // }
                setEditMode(false);
                setShowCreateForm(false);
                setName("");
                setDescription("");
              }}
            />
          </div>
        </div>
      )}

      <div className="w-full space-y-6 p-6">
        {departments.map((dept) => {
          const noManager = !dept.manager;
          const noStaff = !dept.staff || dept.staff.length === 0;
          return (
            <div
              key={dept.id}
              className="rounded-lg border bg-white p-6 shadow-md dark:border-gray-500 dark:bg-gray-800 dark:text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold capitalize">{dept.name}</h2>
                  {/* <p className="text-sm text-gray-500 dark:text-gray-300">
                    {dept.description
                      ? dept.description
                      : "No description provided"}
                  </p> */}
                </div>

                <div className="flex gap-2">
                  {noManager && noStaff ? (
                    <Button
                      title="Assign"
                      icon={<UserPlus size={16} />}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setModalType("assign");
                        setOpen(true);
                      }}
                    />
                  ) : (
                    <>
                      <Button
                        title="Change Manager"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setModalType("changeManager");
                          setOpen(true);
                        }}
                      />
                      <Button
                        title="Update Staff"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setModalType("updateStaff");
                          setCurrentStaff(dept.staff?.map((s) => s.id) || []);
                          setSelectedStaff(dept.staff?.map((s) => s.id) || []);
                          setOpen(true);
                        }}
                      />
                    </>
                  )}
                  <Button
                    title="Edit"
                    onClick={() => {
                      setEditMode(true);
                      setShowCreateForm(true);
                      setName(dept.name);
                      setDescription(dept.description);
                      setSelectedDepartment(dept);
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
          );
        })}
      </div>

      <ModalBody className="mx-3 w-full overflow-y-auto">
        {selectedDepartment && (
          <ModalContent className="w-full space-y-4">
            <h2 className="text-2xl font-bold dark:text-white">
              {selectedDepartment.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedDepartment.description}
            </p>

            {/* STATE for search */}
            {modalType && (
              <>
                {/* Assign Modal */}
                {modalType === "assign" && (
                  <>
                    <Label className="text-sm">Search Manager</Label>
                    <Input
                      placeholder="Search manager..."
                      onChange={(e) => setSelectedManager(e.target.value)}
                      value={selectedManager}
                    />
                    <div className="max-h-40 overflow-y-auto rounded border p-2 dark:bg-gray-700 dark:text-white">
                      {managers?.data
                        ?.filter((m) =>
                          m.name
                            .toLowerCase()
                            .includes(selectedManager.toLowerCase()),
                        )
                        .map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedManager(m.id)}
                            className={`cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              selectedManager === m.id
                                ? "bg-primary text-white"
                                : ""
                            }`}
                          >
                            {m.name}
                          </div>
                        ))}
                    </div>

                    <Label className="mt-4 text-sm">Search & Add Staff</Label>
                    <Input
                      placeholder="Search staff..."
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        const filtered = staff?.data?.filter((s) =>
                          s.name.toLowerCase().includes(value),
                        );
                        setFilteredStaff(filtered ?? []);
                      }}
                    />
                    <div className="max-h-40 overflow-y-auto rounded border p-2 dark:bg-gray-700 dark:text-white">
                      {(filteredStaff.length
                        ? filteredStaff
                        : staff?.data
                      )?.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (!selectedStaff.includes(s.id)) {
                              setSelectedStaff((prev) => [...prev, s.id]);
                            }
                          }}
                          className="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>

                    {selectedStaff.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedStaff.map((id) => {
                          const staffUser = staff?.data?.find(
                            (u) => u.id === id,
                          );
                          return (
                            <span
                              key={id}
                              className="flex items-center gap-1 rounded-full border bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
                            >
                              {staffUser?.name}
                              <button
                                onClick={() =>
                                  setSelectedStaff((prev) =>
                                    prev.filter((uid) => uid !== id),
                                  )
                                }
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <Button title="Assign" onClick={handleFinalAssign} />
                  </>
                )}

                {/* Change Manager Modal */}
                {modalType === "changeManager" && (
                  <>
                    <Label className="text-sm">Search New Manager</Label>
                    <Input
                      placeholder="Search manager..."
                      onChange={(e) => setSelectedManager(e.target.value)}
                      value={selectedManager}
                    />
                    <div className="max-h-40 overflow-y-auto rounded border p-2 dark:bg-gray-700 dark:text-white">
                      {managers?.data
                        ?.filter((m) =>
                          m.name
                            .toLowerCase()
                            .includes(selectedManager.toLowerCase()),
                        )
                        .map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedManager(m.id)}
                            className={`cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              selectedManager === m.id
                                ? "bg-primary text-white"
                                : ""
                            }`}
                          >
                            {m.name}
                          </div>
                        ))}
                    </div>
                    {selectedDepartment.manager && (
                      <p className="mt-2 text-sm text-gray-500">
                        Current Manager: {selectedDepartment.manager.name}
                      </p>
                    )}
                    <Button
                      title="Change Manager"
                      onClick={handleChangeManager}
                    />
                  </>
                )}

                {/* Update Staff Modal */}
                {modalType === "updateStaff" && (
                  <>
                    <Label className="text-sm">Search & Update Staff</Label>
                    <Input
                      placeholder="Search staff..."
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        const filtered = staff?.data?.filter((s) =>
                          s.name.toLowerCase().includes(value),
                        );
                        setFilteredStaff(filtered ?? []);
                      }}
                    />
                    <div className="max-h-40 overflow-y-auto rounded border p-2 dark:bg-gray-700 dark:text-white">
                      {(filteredStaff.length
                        ? filteredStaff
                        : staff?.data
                      )?.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (!selectedStaff.includes(s.id)) {
                              setSelectedStaff((prev) => [...prev, s.id]);
                            }
                          }}
                          className="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>

                    {selectedStaff.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedStaff.map((id) => {
                          const staffUser = staff?.data?.find(
                            (u) => u.id === id,
                          );
                          return (
                            <span
                              key={id}
                              className="flex items-center gap-1 rounded-full border bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
                            >
                              {staffUser?.name}
                              <button
                                onClick={() =>
                                  setSelectedStaff((prev) =>
                                    prev.filter((uid) => uid !== id),
                                  )
                                }
                              >
                                &times;
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <Button title="Update Staff" onClick={handleUpdateStaff} />
                  </>
                )}
              </>
            )}
          </ModalContent>
        )}
      </ModalBody>
    </div>
  );
}
