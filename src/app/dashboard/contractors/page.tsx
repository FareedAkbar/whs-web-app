"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useModal } from "@/components/ui/animated-modal";
import Pagination from "@/app/_components/Pagination";

const ContractorPage = () => {
  const { data: workers, isLoading } = api.workers.getWorkers.useQuery();
  // const [selectedContractor, setSelectedContractor] = useState<User | null>(
  //   null,
  // );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContractors, setFilteredContractors] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (workers?.data) {
      setFilteredContractors(workers.data);
    }
  }, [workers]);

  useEffect(() => {
    const result = workers?.data?.filter(
      (contractor) =>
        contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractor.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredContractors(result ?? []);
  }, [searchTerm, workers]);

  const paginatedContractors = filteredContractors.slice(
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
            {paginatedContractors.map((contractor) => (
              <tr
                key={contractor.id}
                className="border-t dark:border-gray-600 dark:text-white"
              >
                <td className="p-4">{contractor.name}</td>
                <td className="p-4">{contractor.email}</td>
                <td className="p-4">
                  {contractor.role === "WORKER"
                    ? "CONTRACTOR"
                    : contractor.role}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      contractor.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    {contractor.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          totalItems={filteredContractors.length}
          page={page}
          setPage={setPage}
        />
      </div>
      {/* {workers?.data?.map((worker) => (
        <Modal key={worker.id}>
          <ModalTrigger>
            <div
              key={worker.id}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
              onClick={() => setSelectedWorker(worker)}
            >
              <div className="flex items-center gap-4">
                <img
                  src={worker.imageUrl ?? "https://placehold.co/150x150"}
                  alt={worker.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex flex-col items-start">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {worker.name}
                  </h2>
                  <p className="text-sm text-gray-600">{worker.email}</p>
                  <p className="text-sm text-gray-500">
                    Requested Role: {worker.role ?? "None"}
                  </p>
                </div>
              </div>

              {/* <div className="mt-2 flex flex-wrap gap-1">
                {worker.services.map((service, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                  >
                    {service}
                  </span>
                ))}
              </div>
              <p
                className={`mt-2 rounded-md px-2 py-1 text-sm font-semibold ${
                  worker.status === "PENDING"
                    ? "bg-yellow-200 text-yellow-800"
                    : worker.status === "APPROVED"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                }`}
              >
                {worker.status}
              </p> */}
      {/* </div>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-96 rounded-lg bg-white p-6 shadow-2xl">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedWorker?.name}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Email: {selectedWorker?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedWorker?.phoneNumber}
                  </p> */}
      {/* <p className="text-sm text-gray-600">
                    Company: {selectedWorker?.company}
                  </p> */}
      {/* <div className="mt-3 flex flex-wrap gap-1">
                    {selectedWorker?.services.map((service, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <p
                    className={`mt-3 rounded-md px-2 py-1 text-sm font-semibold ${
                      selectedWorker?.status === "PENDING"
                        ? "bg-yellow-200 text-yellow-800"
                        : selectedWorker?.status === "APPROVED"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                    }`}
                  >
                    {selectedWorker?.status}
                  </p> */}

      {/* Accept/Reject Buttons (only for PENDING requests) */}
      {/* {selectedWorker?.isVerifiedByAdmin  && (
                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setSelectedWorker(null)}
                      >
                        Close
                      </button>
                      <button
                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        onClick={() => handleAccept(selectedWorker?.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        onClick={() => handleReject(selectedWorker?.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )} */}

      {/* Close Button (for approved/rejected requests) */}
      {/* {selectedWorker?.status !== "PENDING" && (
                    <div className="mt-6 flex justify-end">
                      <button
                        className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setSelectedWorker(null)}
                      >
                        Close
                      </button>
                    </div>
                  )} */}
      {/* </div>
              </div>
            </ModalContent>
          </ModalBody>
        </Modal>
      ))} */}
    </div>
  );
};

export default ContractorPage;
