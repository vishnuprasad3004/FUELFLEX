// src/services/storage-service.ts
'use server'; // For potential use in Server Actions or API routes

import { storage } from '@/firebase/firebase-config';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, type StorageReference } from 'firebase/storage';
import { z } from 'zod';

const FileUploadInputSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, "Input must be a File object"),
  path: z.string().min(1, "File path cannot be empty."),
});
export type FileUploadInput = z.infer<typeof FileUploadInputSchema>;

const FileDeleteInputSchema = z.object({
  path: z.string().min(1, "File path cannot be empty."),
});
export type FileDeleteInput = z.infer<typeof FileDeleteInputSchema>;

/**
 * Uploads a file to Firebase Cloud Storage.
 * @param input - An object containing the file and the desired storage path.
 * @returns A promise that resolves with the download URL of the uploaded file.
 * @throws Error if the upload fails or Firebase storage is not initialized.
 */
export async function uploadFile(input: FileUploadInput): Promise<string> {
  const validationResult = FileUploadInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Invalid input for file upload: ${validationResult.error.flatten().fieldErrors}`);
  }

  const { file, path } = validationResult.data;

  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Check Firebase configuration.");
  }

  const storageRef = ref(storage, path);

  try {
    console.log(`[StorageService] Uploading file ${file.name} to ${path}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[StorageService] File uploaded successfully. URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`[StorageService] Error uploading file to ${path}:`, error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the download URL for a file in Firebase Cloud Storage.
 * @param path - The full path to the file in Firebase Storage.
 * @returns A promise that resolves with the download URL.
 * @throws Error if the file is not found or Firebase storage is not initialized.
 */
export async function getFileUrl(path: string): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Check Firebase configuration.");
  }
  if (!path || path.trim() === "") {
    throw new Error("File path cannot be empty for getFileUrl.");
  }
  
  const storageRef = ref(storage, path);
  try {
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error(`[StorageService] Error getting download URL for ${path}:`, error);
    if (error.code === 'storage/object-not-found') {
      throw new Error(`File not found at path: ${path}`);
    }
    throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Deletes a file from Firebase Cloud Storage.
 * @param input - An object containing the path to the file to be deleted.
 * @returns A promise that resolves when the file is successfully deleted.
 * @throws Error if deletion fails or Firebase storage is not initialized.
 */
export async function deleteFile(input: FileDeleteInput): Promise<void> {
  const validationResult = FileDeleteInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Invalid input for file deletion: ${validationResult.error.flatten().fieldErrors}`);
  }
  const { path } = validationResult.data;

  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Check Firebase configuration.");
  }
  
  const storageRef = ref(storage, path);
  try {
    console.log(`[StorageService] Deleting file from ${path}`);
    await deleteObject(storageRef);
    console.log(`[StorageService] File deleted successfully from ${path}`);
  } catch (error: any) {
    console.error(`[StorageService] Error deleting file from ${path}:`, error);
    if (error.code === 'storage/object-not-found') {
      console.warn(`[StorageService] Attempted to delete non-existent file at ${path}.`);
      // Optionally, re-throw or handle as a non-critical error
      // throw new Error(`File not found at path: ${path}, cannot delete.`);
      return; // Or resolve silently if file not found is acceptable
    }
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Lists all files and folders within a given path in Firebase Cloud Storage.
 * @param path - The storage path (folder) to list items from. Can be empty to list root.
 * @returns A promise that resolves with an object containing lists of file paths and folder paths.
 * @throws Error if listing fails or Firebase storage is not initialized.
 */
export async function listFilesAndFolders(path: string = ''): Promise<{ files: string[], folders: string[] }> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized. Check Firebase configuration.");
  }

  const storageRef = ref(storage, path);
  const result: { files: string[], folders: string[] } = { files: [], folders: [] };

  try {
    console.log(`[StorageService] Listing items in path: '${path}'`);
    const listResult = await listAll(storageRef);
    
    listResult.items.forEach((itemRef: StorageReference) => {
      result.files.push(itemRef.fullPath);
    });
    
    listResult.prefixes.forEach((folderRef: StorageReference) => {
      result.folders.push(folderRef.fullPath);
    });
    
    console.log(`[StorageService] Found ${result.files.length} files and ${result.folders.length} folders in '${path}'.`);
    return result;
  } catch (error) {
    console.error(`[StorageService] Error listing items in path '${path}':`, error);
    throw new Error(`Failed to list items: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Example usage component (can be removed or adapted for your UI)
// This is a conceptual example of how you might use these functions in a client component.
/*
"use client";
import React, { useState } from 'react';
import { uploadFile as uploadFileToStorage, getFileUrl as getFileUrlFromStorage, deleteFile as deleteFileFromStorage, listFilesAndFolders as listItemsFromStorage } from '@/services/storage-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function StorageDemoComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>('test-uploads/my-file.txt');
  const [message, setMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFilePath(`test-uploads/${event.target.files[0].name}`); // Update path based on file name
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    setMessage("Uploading...");
    try {
      const downloadURL = await uploadFileToStorage({ file, path: filePath });
      setMessage(`File uploaded! URL: ${downloadURL}`);
      setFileUrl(downloadURL);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.message}`);
    }
  };

  const handleGetUrl = async () => {
    if (!filePath) {
      setMessage("Please enter a file path to get URL.");
      return;
    }
    setMessage("Getting URL...");
    try {
      const url = await getFileUrlFromStorage(filePath);
      setMessage(`File URL: ${url}`);
      setFileUrl(url);
    } catch (error: any) {
      setMessage(`Failed to get URL: ${error.message}`);
    }
  };
  
  const handleDelete = async () => {
    if (!filePath) {
      setMessage("Please enter a file path to delete.");
      return;
    }
    setMessage("Deleting...");
    try {
      await deleteFileFromStorage({ path: filePath });
      setMessage(`File deleted from ${filePath}`);
      setFileUrl(''); // Clear URL if file is deleted
    } catch (error: any) {
      setMessage(`Delete failed: ${error.message}`);
    }
  };

  const handleListItems = async (listPath: string) => {
    setMessage(`Listing items in '${listPath}'...`);
    try {
      const items = await listItemsFromStorage(listPath);
      setListedItems(items);
      setMessage(`Listed items in '${listPath}'. Files: ${items.files.length}, Folders: ${items.folders.length}`);
    } catch (error: any) {
      setMessage(`Listing failed: ${error.message}`);
    }
  }

  return (
    <div className="p-4 space-y-4 border rounded-lg m-4">
      <h2 className="text-xl font-semibold">Firebase Storage Demo</h2>
      
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Select file to upload:
        </label>
        <Input id="file-upload" type="file" onChange={handleFileChange} className="mt-1" />
      </div>

      <div>
        <label htmlFor="file-path" className="block text-sm font-medium text-gray-700">
          File Path (e.g., invoices/doc.pdf or users/uid/profile.jpg):
        </label>
        <Input 
          id="file-path" 
          type="text" 
          value={filePath} 
          onChange={(e) => setFilePath(e.target.value)} 
          placeholder="test-uploads/my-image.png" 
          className="mt-1" 
        />
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={handleUpload} disabled={!file}>Upload File</Button>
        <Button onClick={handleGetUrl} disabled={!filePath}>Get File URL</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!filePath}>Delete File</Button>
      </div>

      {fileUrl && (
        <div className="mt-2">
          <p>Last retrieved/uploaded file URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{fileUrl}</a>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-medium">List Items</h3>
        <div className="flex space-x-2 items-center">
            <Input 
              type="text" 
              placeholder="Path to list (e.g., 'test-uploads/' or empty for root)" 
              id="list-path-input"
              className="flex-grow"
            />
            <Button onClick={() => handleListItems((document.getElementById('list-path-input') as HTMLInputElement)?.value || '')}>
                List
            </Button>
        </div>
        { (listedItems.files.length > 0 || listedItems.folders.length > 0) && (
          <div className="p-2 border rounded bg-gray-50 max-h-60 overflow-y-auto">
            <p><strong>Folders:</strong></p>
            {listedItems.folders.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.folders.map(folder => <li key={folder}>{folder}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-500">No folders found.</p>}
            <p className="mt-2"><strong>Files:</strong></p>
            {listedItems.files.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.files.map(file => <li key={file}>{file}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-500">No files found.</p>}
          </div>
        )}
      </div>

      {message && (
        <p className={`mt-4 p-2 rounded ${message.includes('failed') || message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
*/
