import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import complaintsApi from "../api/complaints";
import { useNavigate } from "react-router-dom";
import { Complaint } from "../types/complaint.types";
import { cn } from "../lib/utils";

export default function StaffDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize, statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        assigned_staff: currentUser?.user_id,
      };
      const data = await complaintsApi.getComplaints(page, pageSize, filters);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch complaints");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (complaintId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/complaints/${complaintId}`);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  const handlePriorityFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPriorityFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/75 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Assigned Complaints</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block lg:hidden">
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.complaint_id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.category}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        {
                          "bg-red-100 text-red-800":
                            complaint.priority === "High",
                          "bg-yellow-100 text-yellow-800":
                            complaint.priority === "Medium",
                          "bg-green-100 text-green-800":
                            complaint.priority === "Low",
                        }
                      )}
                    >
                      {complaint.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        {
                          "bg-yellow-100 text-yellow-800":
                            complaint.status === "Pending",
                          "bg-blue-100 text-blue-800":
                            complaint.status === "In Progress",
                          "bg-green-100 text-green-800":
                            complaint.status === "Resolved",
                          "bg-gray-100 text-gray-800":
                            complaint.status === "Closed",
                        }
                      )}
                    >
                      {complaint.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) =>
                        handleViewDetails(complaint.complaint_id, e)
                      }
                      className="w-full inline-flex justify-center items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.complaint_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {complaint.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                          {
                            "bg-yellow-100 text-yellow-800":
                              complaint.status === "Pending",
                            "bg-blue-100 text-blue-800":
                              complaint.status === "In Progress",
                            "bg-green-100 text-green-800":
                              complaint.status === "Resolved",
                            "bg-gray-100 text-gray-800":
                              complaint.status === "Closed",
                          }
                        )}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                          {
                            "bg-red-100 text-red-800":
                              complaint.priority === "High",
                            "bg-yellow-100 text-yellow-800":
                              complaint.priority === "Medium",
                            "bg-green-100 text-green-800":
                              complaint.priority === "Low",
                          }
                        )}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(complaint.complaint_id, e);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <p className="text-sm text-center sm:text-left text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> results
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
