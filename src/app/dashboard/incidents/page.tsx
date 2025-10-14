"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, Filter, Search } from "lucide-react";
import { api } from "@/trpc/react";

import Dropdown from "@/components/ui/Dropdown";
import { Select } from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { set } from "zod";
import { useSession } from "next-auth/react";
import { severityMapping } from "@/constants/severity";
import { useRouter } from "next/navigation";
import { ReportResponse } from "@/types/report";

export default function IncidentsList() {
  const { data: incidents, isLoading } = api.incidents.getIncidents.useQuery();
  // const { data: workers } = api.workers.getWorkers.useQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredIncidents, setFilteredIncidents] = useState<ReportResponse[]>(
    incidents?.data ?? [],
  );

  const router = useRouter();

  const statusMapping = {
    INITIATED: "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 text-blue-600",
    IN_PROGRESS:
      "bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-50 text-yellow-600",
    COMPLETED:
      "bg-green-100 dark:bg-green-900 dark:bg-opacity-50 text-green-600",
    CANCELLED: "bg-red-100 dark:bg-red-900 dark:bg-opacity-50 text-red-600",
    ASSIGNED:
      "bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 text-purple-600",
    CLOSED: "bg-gray-100 dark:bg-gray-900 dark:text-gray-400 text-gray-600",
  };
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [priority, setPriority] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [assignedTo, setAssignedTo] = useState("");
  // const [taskType, setTaskType] = useState("");
  const session = useSession();

  useEffect(() => {
    if (incidents?.data) {
      setFilteredIncidents(incidents.data);
    }
  }, [incidents?.data]);
  const toggleArrayValue = (
    val: string,
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    state: string[],
  ) => {
    if (state.includes(val)) {
      setFn(state.filter((v) => v !== val));
    } else {
      setFn([...state, val]);
    }
  };
  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPriority([]);
    setStatus([]);
    setAssignedTo("");
    // setTaskType("");
    setIsFilterOpen(false);
    setSearchTerm("");
    setFilteredIncidents(incidents?.data ?? []);
  };
  const handleFilter = () => {
    if (!incidents?.data) return;

    setFilteredIncidents(
      incidents?.data?.filter((item: ReportResponse) => {
        return (
          (!dateFrom || item.report.createdAt >= dateFrom) &&
          (!dateTo || item.report.createdAt <= dateTo) &&
          (!priority.length || priority.includes(item.report.priority)) &&
          (!status.length || status.includes(item.incident?.status! ?? "")) &&
          // (!status.length || status.includes(item.report.status)) &&
          // (!assignedTo ||
          //   (Array.isArray(item.incidentAssignee) &&
          //     item.incidentAssignee.some(
          //       (assignee) => assignee.assignedTo === assignedTo,
          //     ))) &&
          // (!taskType || item.report.taskType === taskType) &&
          (!searchTerm ||
            item.report.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            item.report.title.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }) ?? [],
    );
    setIsFilterOpen(false);
  };

  useEffect(() => {
    handleFilter();
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col px-8">
      <div className="sticky top-0 z-10 mb-4 flex h-full items-center justify-between backdrop-blur">
        <input
          type="text"
          placeholder="Search incidents..."
          className="my-2 w-full rounded-l-md border border-gray-300 px-2 py-3 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dropdown
          button={
            <button className="flex w-full flex-row items-center border border-gray-300 bg-[#F9F9F9] px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              Filters
              <ChevronDown className="ml-2 inline" size={16} />
            </button>
          }
          className="absolute right-0 z-50"
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
        >
          <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200">
            <p className="border-b pb-2 font-bold">Filter</p>
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium">Date Range</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-1/2 rounded border border-gray-300 px-2 py-1 dark:bg-gray-800"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-1/2 rounded border border-gray-300 px-2 py-1 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Priority Checkboxes */}
            <div>
              <label className="text-sm font-medium">Priority</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {["LOW", "MEDIUM", "HIGH", "EXTREME"].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-1 text-sm capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={priority.includes(p)}
                      onChange={() =>
                        toggleArrayValue(p, setPriority, priority)
                      }
                      className="accent-primary"
                    />
                    {p.toLowerCase()}
                  </label>
                ))}
              </div>
            </div>

            {/* Status Checkboxes */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {Object.keys(statusMapping).map((statusName) => (
                  <label
                    key={statusName}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={status.includes(statusName)}
                      onChange={() =>
                        toggleArrayValue(statusName, setStatus, status)
                      }
                      className="accent-primary"
                    />
                    <span
                      // className={`rounded-full px-2 py-0.5 text-xs ${statusMapping[statusName as keyof typeof statusMapping]}`}
                      className={`capitalize`}
                    >
                      {statusName.replace("_", " ").toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assigned Person */}
            {/* {session.data?.user?.role == "ADMIN" && (
              <div>
                <Select
                  options={
                    workers?.data?.map((worker) => ({
                      label: worker.name,
                      value: worker.id,
                    })) ?? []
                  }
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  label="Assigned To"
                />
              </div>
            )} */}

            {/* Task Type */}
            {/* <div>
              <label className="font-medium">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full border border-gray-300 px-2 py-1 rounded mt-1"
              >
                <option value="">Select</option>
                {taskTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Filter Button */}
            <Button
              // className="mt-3 w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700"
              onClick={handleFilter}
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
      <div className="custom-scrollbar grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-4 lg:grid-cols-2 lg:px-8">
        {filteredIncidents.length > 0 &&
          filteredIncidents?.map((item) => (
            <div
              key={item.report.id}
              className="cursor-pointer rounded-lg border bg-white p-5 shadow-md hover:shadow-lg dark:border-gray-500 dark:bg-gray-800 dark:shadow-gray-700"
              // onClick={() => {
              //   setSelectedIncident(item);
              //   setOpen(true);
              // }}
              onClick={() =>
                router.push(`/dashboard/incidents/${item.report.id}`)
              }
            >
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div className="flex gap-3">
                  <div className="h-fit rounded-xl bg-gradient-to-r from-gray-300 via-[#F9F9F9] to-gray-300 p-2 dark:from-gray-600 dark:via-gray-700 dark:to-gray-600">
                    <AlertTriangle
                      size={40}
                      color={`${severityMapping[item?.report?.priority] ?? "black"}`}
                    />
                  </div>
                  {/* <img
                    src={item.media[0]?.url ?? "https://placehold.co/150x150"}
                    alt="Incident"
                    className="h-16 w-16 rounded-full object-cover shadow"
                    width={64}
                    height={64}
                  /> */}

                  <div>
                    <h2
                      className="font-semibold capitalize"
                      style={{
                        color:
                          severityMapping[item?.report?.priority] ?? "#000",
                      }}
                    >
                      {item.report.title}
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.report.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-end gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${statusMapping[item.incident?.status as keyof typeof statusMapping]}`}
                  >
                    {item.incident?.status.replace("_", " ")}
                  </span>
                  {/* <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${
                      severityMapping[
                        item?.report
                          ?.priority as keyof typeof severityMapping
                      ] || "bg-gray-400"
                    }`}
                  >
                    <AlertTriangle size={18} />
                    <span>{item?.report?.priority}</span>
                  </div> */}
                </div>
              </div>

              {/* {item.incidentAssignee && item.incidentAssignee.length > 0 ? (
                <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                  <p className="font-medium">Assigned to:</p>
                  {item.incidentAssignee.map(
                    (assignee, index) =>
                      assignee.assignedToData && (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize text-gray-800">
                            {assignee.assignedToData.name}
                          </span>

                          <span className="text-xs text-gray-600">
                            (
                            {assignee.acceptanceStatus === true
                              ? "Accepted"
                              : assignee.acceptanceStatus === false
                                ? "Rejected"
                                : "Pending"}
                            )
                          </span>
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 border-t pt-3">
                  <p className="text-sm">Not assigned yet</p>
                </div>
              )} */}
            </div>
          ))}
        {filteredIncidents.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            No incidents found
          </div>
        )}
      </div>
    </div>
  );
}
