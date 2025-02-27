import { storage } from "../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import complaintsApi from "../api/complaints";
import { getAuth } from "firebase/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const uploadFile = async (
  file: File,
  complaintId: number,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(
        "Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed"
      );
    }

    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User must be authenticated to upload files");
    }

    // Create file reference
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `complaints/${complaintId}/${fileName}`);

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return promise that resolves with download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle specific Firebase Storage errors
          switch (error.code) {
            case "storage/unauthorized":
              reject(
                new Error(
                  "Permission denied. Please check if you're logged in."
                )
              );
              break;
            case "storage/canceled":
              reject(new Error("Upload was cancelled"));
              break;
            case "storage/unknown":
              reject(new Error("An unknown error occurred"));
              break;
            default:
              reject(error);
          }
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save attachment info to database
            await complaintsApi.createAttachment({
              complaint_id: complaintId,
              file_name: fileName,
              file_url: downloadURL,
              file_type: file.type,
              file_size: file.size,
            });

            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to upload file");
  }
};
