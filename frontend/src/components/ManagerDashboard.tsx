import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import complaintsApi from "../api/complaints";
import usersApi from "../api/users";
import { useNavigate } from "react-router-dom";
import ComplaintDetail from "./ComplaintDetail";
import { Complaint, ComplaintStatus } from "../types/complaint.types";
import { cn } from "../lib/utils";

export default function ManagerDashboard() {
  const { currentUser } = useAuth();
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
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(
    null
  );

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

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      await complaintsApi.createComplaintUpdate({
        complaint_id: complaintId,
        updated_by: currentUser!.user_id,
        status: newStatus as ComplaintStatus,
        comment: `Status updated to ${newStatus}`,
      });
      // update the complaint status in the complaints array
      setComplaints(
        complaints.map((complaint) =>
          complaint.complaint_id === complaintId
            ? { ...complaint, status: newStatus as ComplaintStatus }
            : complaint
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const handleAssignStaff = async (complaintId: number) => {
    const selectedStaff = selectedStaffMap[complaintId];
    if (!selectedStaff) return;

    try {
      await complaintsApi.updateComplaint(complaintId, {
        assigned_staff: selectedStaff,
      });
    } catch (error) {
      console.error("Error assigning staff:", error);
      alert("Error assigning staff");
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/75 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Complaint Management</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Complaints Table */}
          <div className="overflow-x-auto">
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
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                          Assign
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
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * pageSize, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= total}
                    className="px-4 py-2 border rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
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
