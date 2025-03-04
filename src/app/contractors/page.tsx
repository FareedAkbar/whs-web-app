"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  status: string;
  company?: string; // Optional field for company name
}

export default function ContractorsList() {
  const { data: contractors, isLoading } =
    api.contractors.getContractors.useQuery();
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);

  const handleAccept = (contractorId: string) => {
    // API call to accept request (Replace with actual mutation)
    // api.contractors.acceptRequest.mutate({ contractorId });
    setSelectedContractor(null);
  };

  const handleReject = (contractorId: string) => {
    // API call to reject request (Replace with actual mutation)
    // api.contractors.rejectRequest.mutate({ contractorId });
    setSelectedContractor(null);
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading contractors...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Contractors</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contractors?.data?.map((contractor) => (
          <div
            key={contractor.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
            onClick={() => setSelectedContractor(contractor)}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {contractor.name}
            </h2>
            {/* <p className="text-sm text-gray-600">{contractor.company}</p> */}
            <div className="mt-2 flex flex-wrap gap-1">
              {contractor.services.map((service, index) => (
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
                contractor.status === "PENDING"
                  ? "bg-yellow-200 text-yellow-800"
                  : contractor.status === "APPROVED"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
              }`}
            >
              {contractor.status}
            </p>
          </div>
        ))}
      </div>

      {/* Modal for Contractor Details */}
      {selectedContractor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedContractor.name}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Email: {selectedContractor.email}
            </p>
            <p className="text-sm text-gray-600">
              Phone: {selectedContractor.phone}
            </p>
            <p className="text-sm text-gray-600">
              Company: {selectedContractor.company}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedContractor.services.map((service, index) => (
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
                selectedContractor.status === "PENDING"
                  ? "bg-yellow-200 text-yellow-800"
                  : selectedContractor.status === "APPROVED"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
              }`}
            >
              {selectedContractor.status}
            </p>

            {/* Accept/Reject Buttons (only for PENDING requests) */}
            {selectedContractor.status === "PENDING" && (
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedContractor(null)}
                >
                  Close
                </button>
                <button
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={() => handleAccept(selectedContractor.id)}
                >
                  Accept
                </button>
                <button
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  onClick={() => handleReject(selectedContractor.id)}
                >
                  Reject
                </button>
              </div>
            )}

            {/* Close Button (for approved/rejected requests) */}
            {selectedContractor.status !== "PENDING" && (
              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedContractor(null)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
