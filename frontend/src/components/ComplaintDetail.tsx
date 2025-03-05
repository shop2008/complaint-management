import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import complaintsApi from "../api/complaints";
import { useAuth } from "../contexts/AuthContext";
import {
  Attachment,
  Complaint,
  ComplaintUpdate,
} from "../types/complaint.types";
import { Button } from "./ui/button";
import { ConfirmationDialog } from "./ui/confirmation-dialog";

interface ComplaintDetailProps {
  complaintId: number;
  onClose?: () => void;
}

export default function ComplaintDetail({
  complaintId,
  onClose,
}: ComplaintDetailProps) {
  const { currentUser } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "complaint" | "update";
    id?: number;
  }>({
    isOpen: false,
    type: "complaint",
  });

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch complaint details
      const complaintData = await complaintsApi.getComplaintById(complaintId);
      setComplaint(complaintData);
      setNewStatus(complaintData.status);

      // Fetch update history
      await fetchUpdateHistory();

      // Fetch attachments
      const attachmentsData = await complaintsApi.getComplaintAttachments(
        complaintId
      );
      setAttachments(attachmentsData || []);
    } catch (err: any) {
      // Extract error message from Axios error or use fallback
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to fetch complaint details";
      setError(errorMessage);
      setComplaint(null);
      setUpdates([]);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch update history
  const fetchUpdateHistory = async () => {
    const updatesData = await complaintsApi.getComplaintUpdates(complaintId);
    setUpdates(updatesData || []);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !complaint || isSubmitting) return;

    try {
      setIsSubmitting(true);
      // create the complaint update and update the complaint status
      const [complaintUpdate, complaint] = await Promise.all([
        complaintsApi.createComplaintUpdate({
          complaint_id: complaintId,
          updated_by: currentUser!.user_id,
          status: newStatus,
          comment: newComment,
        }),
        complaintsApi.updateComplaint(complaintId, {
          status: newStatus,
        }),
      ]);

      if (complaintUpdate && complaint) {
        // update the complaint updates list
        await fetchUpdateHistory();
        setComplaint(complaint);
        setNewComment("");
        setNewStatus("");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to update complaint";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!complaint || isDeleting) return;
    setDeleteDialog({
      isOpen: true,
      type: "complaint",
    });
  };

  const handleDeleteUpdate = async (updateId: number) => {
    if (isDeleting) return;
    setDeleteDialog({
      isOpen: true,
      type: "update",
      id: updateId,
    });
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      if (deleteDialog.type === "complaint") {
        await complaintsApi.deleteComplaint(complaintId);
        if (onClose) onClose();
      } else if (deleteDialog.type === "update" && deleteDialog.id) {
        // Delete the complaint update
        await complaintsApi.deleteComplaintUpdate(deleteDialog.id);

        // Get the previous update to revert the status
        const previousUpdate = updates.find(
          (update) => update.update_id !== deleteDialog.id
        );
        if (previousUpdate) {
          // Update the complaint with the previous status
          await complaintsApi.updateComplaint(complaintId, {
            status: previousUpdate.status,
          });
        } else {
          // If no previous update, set the complaint status to "Pending"
          await complaintsApi.updateComplaint(complaintId, {
            status: "Pending",
          });
        }

        // Refresh the updates list and complaint details
        await fetchComplaintDetails();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        `Failed to delete ${deleteDialog.type}`;
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
          {onClose && (
            <Button variant="outline" className="ml-4" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Complaint not found
          {onClose && (
            <Button variant="outline" className="ml-4" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Complaint #{complaintId}
          </h1>
          <div className="flex gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
            {currentUser?.user_id === complaint.user_id && (
              <Button
                variant="destructive"
                onClick={handleDeleteComplaint}
                disabled={isDeleting}
              >
                Delete Complaint
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="xl:col-span-4 space-y-4 sm:space-y-6">
            {/* Complaint Info */}
            <div className="w-full bg-card rounded-lg shadow p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                Complaint Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Category
                  </label>
                  <p className="font-medium">{complaint.category}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Status
                  </label>
                  <p className="font-medium">{complaint.status}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Priority
                  </label>
                  <p className="font-medium">{complaint.priority}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Created At
                  </label>
                  <p className="font-medium">
                    {new Date(complaint.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Description
                </label>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div className="w-full bg-card rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Attachments
              </h2>
              {attachments && attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.attachment_id}
                      className="bg-muted rounded-lg p-4 flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-icons text-primary">
                          attachment
                        </span>
                        <span className="font-medium truncate">
                          attachment_{attachment.attachment_id}
                        </span>
                      </div>
                      <a
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-auto"
                      >
                        View Attachment
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">
                  <span className="material-icons text-4xl mb-2">
                    attachment
                  </span>
                  <p>No attachments</p>
                </div>
              )}
            </div>

            {/* Update Form */}
            {(currentUser?.role === "Staff" ||
              currentUser?.role === "Manager" ||
              currentUser?.role === "Admin") && (
              <form
                onSubmit={handleUpdateSubmit}
                className="w-full bg-card rounded-lg shadow p-4 sm:p-6 space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-semibold">Add Update</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      rows={4}
                      placeholder="Enter your update..."
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      disabled={isSubmitting}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Update"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Update History */}
            <div className="w-full bg-card rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Update History
                </h2>
                <span className="text-sm text-muted-foreground">
                  {updates.length} {updates.length === 1 ? "update" : "updates"}
                </span>
              </div>
              <div className="space-y-4">
                {updates && updates.length > 0 ? (
                  updates.map((update) => (
                    <div
                      key={update.update_id}
                      className="bg-muted/50 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-sm">
                            account_circle
                          </span>
                          <span className="text-sm font-medium">
                            {update.updated_by_name}
                          </span>
                          {/* {update.updated_by === complaint?.assigned_staff && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              Assigned Staff
                            </span>
                          )} */}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.updated_at).toLocaleString()}
                          </span>
                          {(currentUser?.role === "Admin" ||
                            currentUser?.user_id === update.updated_by) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteUpdate(update.update_id)
                              }
                              disabled={isDeleting}
                              className="h-8 w-8"
                            >
                              <span className="material-icons text-destructive text-sm">
                                delete
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm">{update.comment}</p>
                        {update.status && (
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="material-icons text-sm">sync</span>
                            Status changed to:{" "}
                            <span
                              className={cn(
                                "font-medium px-2 py-0.5 rounded-full text-xs",
                                {
                                  "bg-yellow-100 text-yellow-800":
                                    update.status === "Pending",
                                  "bg-blue-100 text-blue-800":
                                    update.status === "In Progress",
                                  "bg-green-100 text-green-800":
                                    update.status === "Resolved",
                                  "bg-gray-100 text-gray-800":
                                    update.status === "Closed",
                                }
                              )}
                            >
                              {update.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">
                    <span className="material-icons text-4xl mb-2">
                      history
                    </span>
                    <p>No updates yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, type: "complaint" })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${
          deleteDialog.type === "complaint" ? "Complaint" : "Update"
        }`}
        message={`Are you sure you want to delete this ${
          deleteDialog.type === "complaint" ? "complaint" : "update"
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
