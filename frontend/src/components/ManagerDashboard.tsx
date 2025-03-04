import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import complaintsApi from "../api/complaints";
import usersApi from "../api/users";
import { cn } from "../lib/utils";
import { Complaint } from "../types/complaint.types";
import ComplaintDetail from "./ComplaintDetail";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [selectedStaffMap, setSelectedStaffMap] = useState<
    Record<number, string>
  >({});
  const [assigningStaff, setAssigningStaff] = useState<Record<number, boolean>>(
    {}
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(
    null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    fetchComplaints();
    fetchStaffMembers();
  }, [page, pageSize, statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        // assigned_staff: Object.values(selectedStaffMap).join(",") || undefined,
      };
      const data = await complaintsApi.getComplaints(page, pageSize, filters);
      setComplaints(data.complaints);
      setTotal(data.total);
      setSelectedStaffMap(
        data.complaints.reduce(
          (acc: Record<number, string>, complaint: Complaint) => {
            acc[complaint.complaint_id] = complaint.assigned_staff ?? "";
            return acc;
          },
          {} as Record<number, string>
        )
      );
    } catch (err) {
      setError("Failed to fetch complaints");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const staff = await usersApi.getStaffMembers();
      setStaffMembers(staff);
    } catch (err) {
      console.error("Failed to fetch staff members:", err);
    }
  };

  const handleAssignStaff = async (complaintId: number) => {
    const selectedStaff = selectedStaffMap[complaintId];
    if (!selectedStaff) {
      setFeedback({
        type: "error",
        message: "Please select a staff member first",
      });
      return;
    }

    try {
      setAssigningStaff((prev) => ({ ...prev, [complaintId]: true }));
      await complaintsApi.updateComplaint(complaintId, {
        assigned_staff: selectedStaff,
      });
      setFeedback({ type: "success", message: "Staff assigned successfully" });
      // Refresh the complaints list to show updated assignment
      fetchComplaints();
    } catch (error) {
      console.error("Error assigning staff:", error);
      setFeedback({ type: "error", message: "Failed to assign staff member" });
    } finally {
      setAssigningStaff((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleViewDetails = (complaintId: number) => {
    navigate(`/complaints/${complaintId}`);
  };

  const handleCloseDetails = () => {
    setSelectedComplaintId(null);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePriorityFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPriorityFilter(e.target.value);
    setPage(1);
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
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {feedback.type === "success" ? (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {feedback.message}
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/75 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Complaint Management</h2>

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
                    <div className="flex flex-col space-y-2">
                      <select
                        value={selectedStaffMap[complaint.complaint_id] || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedStaffMap({
                            ...selectedStaffMap,
                            [complaint.complaint_id]: e.target.value,
                          });
                        }}
                        className="w-full text-sm rounded-md border-gray-300"
                      >
                        <option value="">Select Staff</option>
                        {staffMembers.map((staff) => (
                          <option key={staff.user_id} value={staff.user_id}>
                            {staff.full_name}
                          </option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignStaff(complaint.complaint_id);
                          }}
                          disabled={assigningStaff[complaint.complaint_id]}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {assigningStaff[complaint.complaint_id] ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Assigning...
                            </>
                          ) : (
                            "Assign"
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(complaint.complaint_id);
                          }}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
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
                    Assigned To
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedStaffMap[complaint.complaint_id] || ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedStaffMap({
                              ...selectedStaffMap,
                              [complaint.complaint_id]: e.target.value,
                            });
                          }}
                          className="text-sm rounded-md border-gray-300"
                        >
                          <option value="">Select Staff</option>
                          {staffMembers.map((staff) => (
                            <option key={staff.user_id} value={staff.user_id}>
                              {staff.full_name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignStaff(complaint.complaint_id);
                          }}
                          disabled={assigningStaff[complaint.complaint_id]}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {assigningStaff[complaint.complaint_id] ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Assigning...
                            </>
                          ) : (
                            "Assign"
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(complaint.complaint_id);
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

      {selectedComplaintId && (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
