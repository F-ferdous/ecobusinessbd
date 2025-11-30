import { storage } from "@/lib/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  UploadMetadata,
} from "firebase/storage";

export function makeStoragePath(folder: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${Date.now()}-${safeName}`;
}

export async function uploadFileAndGetURL(
  file: File,
  path: string,
  metadata?: UploadMetadata,
  onProgress?: (pct: number) => void
): Promise<{ url: string; path: string }> {
  if (!storage) throw new Error("Firebase storage not initialized");
  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(fileRef, file, metadata);

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress && snap.totalBytes > 0) {
          const pct = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          onProgress(pct);
        }
      },
      (err) => reject(err),
      () => resolve()
    );
  });

  const url = await getDownloadURL(task.snapshot.ref);
  return { url, path };
}
