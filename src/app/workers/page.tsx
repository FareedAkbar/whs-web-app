"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal"; // Adjust the import path as necessary

interface worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  status: string;
  company?: string; // Optional field for company name
}

export default function workersList() {
  const { data: workers, isLoading } = api.workers.getWorkers.useQuery();
  const [selectedWorker, setSelectedWorker] = useState<worker | null>(null);

  const handleAccept = (workerId: string) => {
    // API call to accept request (Replace with actual mutation)
    // api.workers.acceptRequest.mutate({ workerId });
    setSelectedWorker(null);
  };

  const handleReject = (workerId: string) => {
    // API call to reject request (Replace with actual mutation)
    // api.workers.rejectRequest.mutate({ workerId });
    setSelectedWorker(null);
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading workers...</p>;
  }

  return (
    <div className="ml-80 mt-20 flex w-full flex-col gap-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">workers</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workers?.data?.map((worker) => (
          <div
            key={worker.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
            onClick={() => setSelectedWorker(worker)}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {worker.name}
            </h2>
            {/* <p className="text-sm text-gray-600">{worker.company}</p> */}
            <div className="mt-2 flex flex-wrap gap-1">
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
            </p>
          </div>
        ))}
      </div>
      {workers?.data?.map((worker) => (
        <Modal key={worker.id}>
          <ModalTrigger>
            <div
              key={worker.id}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
              onClick={() => setSelectedWorker(worker)}
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {worker.name}
              </h2>
              {/* <p className="text-sm text-gray-600">{worker.company}</p> */}
              <div className="mt-2 flex flex-wrap gap-1">
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
              </p>
            </div>
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
                    Phone: {selectedWorker?.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Company: {selectedWorker?.company}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
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
                  </p>

                  {/* Accept/Reject Buttons (only for PENDING requests) */}
                  {selectedWorker?.status === "PENDING" && (
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
                  )}

                  {/* Close Button (for approved/rejected requests) */}
                  {selectedWorker?.status !== "PENDING" && (
                    <div className="mt-6 flex justify-end">
                      <button
                        className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setSelectedWorker(null)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ModalContent>
          </ModalBody>
        </Modal>
      ))}
      {/* Modal for worker Details */}
    </div>
  );
}
