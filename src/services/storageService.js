import { storage, ID } from "../lib/appwrite";
import { DATABASE_CONFIG } from "../utils/constants";

const { storageBucketId } = DATABASE_CONFIG;

export const storageService = {
  async uploadImage(file) {
    if (!file || !storageBucketId) {
      throw new Error("Storage bucket ID is not configured");
    }

    try {
      const uploadedFile = await storage.createFile(
        storageBucketId,
        ID.unique(),
        file,
      );
      return uploadedFile.$id;
    } catch (error) {
      throw new Error(error.message || "Failed to upload image");
    }
  },

  getImageUrl(fileId) {
    if (!fileId || !storageBucketId) return null;
    return storage.getFilePreview(storageBucketId, fileId).toString();
  },

  async deleteImage(fileId) {
    if (!fileId || !storageBucketId) return;

    try {
      await storage.deleteFile(storageBucketId, fileId);
    } catch (error) {
      throw new Error(error.message || "Failed to delete image");
    }
  },
};
