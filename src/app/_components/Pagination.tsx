import { ChevronLeft, ChevronRight } from "lucide-react";
interface PaginationProps {
  totalItems: number; // Replace with your actual data type
  page: number;
  setPage: (page: number) => void;
  itemsPerPage?: number; // Optional prop for items per page
}
const Pagination = ({
  totalItems,
  page,
  setPage,
  itemsPerPage = 10,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startEntry = (page - 1) * itemsPerPage + 1;
  const endEntry = Math.min(startEntry + itemsPerPage - 1, totalItems);

  return (
    <div className="mt-4 flex flex-col p-3 text-sm md:flex-row md:items-center md:justify-between">
      {/* Entry Info */}
      <div className="mb-2 text-gray-600 md:mb-0 dark:text-gray-200">
        Showing {startEntry} to {endEntry} of {totalItems} entries
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center">
        <button
          className="mr-2 rounded border bg-gray-100 p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 dark:text-white"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => setPage(pg)}
            className={`rounded px-3 py-1.5 dark:text-white ${
              pg === page
                ? "bg-primary text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            {pg}
          </button>
        ))}

        <button
          className="ml-2 rounded border bg-gray-100 p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 dark:text-white"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
