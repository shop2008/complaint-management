import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import complaintsApi from "../api/complaints";
import { Complaint } from "../types/complaint.types";
import { uploadFile } from "../services/fileUpload";

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [userComplaints, setUserComplaints] = useState<any[]>([]);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    complaintId: number | null;
    rating: number;
    comment: string;
  }>({
    isOpen: false,
    complaintId: null,
    rating: 5,
    comment: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserComplaints();
    }
  }, [currentUser]);

  const loadUserComplaints = async () => {
    try {
      if (!currentUser?.user_id) return;
      const complaints = await complaintsApi.getUserComplaints(
        currentUser.user_id
      );

      // Check feedback for resolved complaints
      const complaintsWithFeedback = await Promise.all(
        complaints.map(async (complaint: Complaint) => {
          if (complaint.status === "Resolved") {
            try {
              const feedback = await complaintsApi.getComplaintFeedback(
                complaint.complaint_id
              );
              return {
                ...complaint,
                feedback: feedback || null,
              };
            } catch (error) {
              return {
                ...complaint,
                feedback: null,
              };
            }
          }
          return complaint;
        })
      );

      setUserComplaints(complaintsWithFeedback);
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Reset any previous error messages
      setSubmitStatus(null);

      // Validate each file
      const invalidFiles = newFiles.filter(
        (file) =>
          file.size > 10 * 1024 * 1024 ||
          ![
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
          ].includes(file.type)
      );

      if (invalidFiles.length > 0) {
        setSubmitStatus({
          type: "error",
          message:
            "Some files were rejected. Please ensure all files are under 10MB and are image files (JPEG, PNG, GIF, WebP, SVG).",
        });
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setSubmitStatus({
        type: "error",
        message: "Please login or register to submit a complaint.",
      });
      return;
    }

    try {
      setIsUploading(true);
      setSubmitStatus(null);

      // Create the complaint
      const complaint = await complaintsApi.createComplaint({
        user_id: currentUser.user_id,
        category,
        description,
        priority,
      });

      // Upload attachments if any
      if (attachments.length > 0) {
        try {
          await Promise.all(
            attachments.map((file) =>
              uploadFile(file, complaint.complaint_id, (progress) => {
                setUploadProgress(progress);
              })
            )
          );
        } catch (error) {
          console.error("Error uploading attachments:", error);
          setSubmitStatus({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Error uploading attachments. Please try again.",
          });
          return;
        }
      }

      // Reset form
      setCategory("");
      setDescription("");
      setPriority("Medium");
      setAttachments([]);
      setUploadProgress(0);
      setSubmitStatus({
        type: "success",
        message: "Complaint submitted successfully!",
      });

      // Reload complaints if user is logged in
      if (currentUser) {
        loadUserComplaints();
      }
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error submitting complaint. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!feedbackModal.complaintId) return;

      await complaintsApi.submitFeedback({
        complaint_id: feedbackModal.complaintId,
        rating: feedbackModal.rating,
        comment: feedbackModal.comment,
      });

      setFeedbackModal({
        isOpen: false,
        complaintId: null,
        rating: 5,
        comment: "",
      });

      // Reload complaints to update the feedback status
      loadUserComplaints();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus({
        type: "error",
        message: "Error submitting feedback. Please try again.",
      });
    }
  };

  const handleViewDetails = (complaintId: number) => {
    navigate(`/complaints/${complaintId}`);
  };

  return (
    <div className="space-y-0">
      {/* Submit Complaint Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/75 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Submit a Complaint</h2>
          {!currentUser && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">
                Please{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  login
                </button>{" "}
                or{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  register
                </button>{" "}
                to submit a complaint and track its status.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Billing">Billing</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "Low" | "Medium" | "High")
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="material-icons mr-2">attach_file</span>
                    Add Files
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 px-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selected Files
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="material-icons text-gray-400">
                          description
                        </span>
                        <span className="text-sm text-gray-600 truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-icons">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      Uploading...
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className={`flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isUploading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Submitting...
                  </>
                ) : (
                  "Submit Complaint"
                )}
              </button>
            </div>
          </form>

          {submitStatus && (
            <div
              className={`mt-4 p-4 rounded-md ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* My Complaints Section */}
      {userComplaints.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/75 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">My Complaints</h2>

            {/* Mobile View */}
            <div className="block lg:hidden">
              <div className="space-y-4">
                {userComplaints.map((complaint) => (
                  <div
                    key={complaint.complaint_id}
                    className="bg-white rounded-lg border border-gray-200 s
                    3"
                    onClick={() => handleViewDetails(complaint.complaint_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.category}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.priority === "High"
                            ? "bg-red-100 text-red-800"
                            : complaint.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          complaint.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : complaint.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : complaint.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {complaint.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(complaint.complaint_id);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {complaint.status === "Resolved" && (
                        <>
                          {complaint.feedback ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                <span className="material-icons text-sm">
                                  star
                                </span>
                              </span>
                              <span className="text-green-600 text-sm">
                                Rating: {complaint.feedback.rating}/5
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFeedbackModal({
                                  isOpen: true,
                                  complaintId: complaint.complaint_id,
                                  rating: 5,
                                  comment: "",
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Give Feedback
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userComplaints.map((complaint) => (
                    <tr
                      key={complaint.complaint_id}
                      onClick={() => handleViewDetails(complaint.complaint_id)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {complaint.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : complaint.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : complaint.status === "Resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            complaint.priority === "High"
                              ? "bg-red-100 text-red-800"
                              : complaint.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(complaint.complaint_id);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                          {complaint.status === "Resolved" && (
                            <>
                              {complaint.feedback ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">
                                    <span className="material-icons text-sm">
                                      star
                                    </span>
                                  </span>
                                  <span className="text-green-600">
                                    Rating: {complaint.feedback.rating}/5
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFeedbackModal({
                                      isOpen: true,
                                      complaintId: complaint.complaint_id,
                                      rating: 5,
                                      comment: "",
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Give Feedback
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Submit Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setFeedbackModal((prev) => ({ ...prev, rating }))
                      }
                      className={`p-2 rounded-full ${
                        feedbackModal.rating >= rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      <span className="material-icons">star</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  value={feedbackModal.comment}
                  onChange={(e) =>
                    setFeedbackModal((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 px-2 py-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackModal({
                      isOpen: false,
                      complaintId: null,
                      rating: 5,
                      comment: "",
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
