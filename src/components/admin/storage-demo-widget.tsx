
"use client";
import React, { useState, useEffect } from 'react';
import { uploadFile as uploadFileToStorage, getFileUrl as getFileUrlFromStorage, deleteFile as deleteFileFromStorage, listFilesAndFolders as listItemsFromStorage } from '@/services/storage-service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import from UI library
import { UploadCloud } from "lucide-react";

export function StorageDemoWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<string>(''); 
  const [message, setMessage] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [listedItems, setListedItems] = useState<{ files: string[], folders: string[] }>({ files: [], folders: [] });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 
    // Set initial filePath on client-side to avoid hydration mismatch if it relied on window or other browser APIs
    // For a simple default, this is fine. If it needs to be dynamic based on browser properties, ensure it's client-side only.
    setFilePath('test-uploads/my-file.txt'); 
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFilePath(`test-uploads/${selectedFile.name}`); 
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
      setFileUrl(''); 
    } catch (error: any) {
      setMessage(`Delete failed: ${error.message}`);
    }
  };

  const handleListItems = async (listPath: string) => {
    if (!isClient) return; 
    setMessage(`Listing items in '${listPath}'...`);
    try {
      const items = await listItemsFromStorage(listPath);
      setListedItems(items);
      setMessage(`Listed items in '${listPath}'. Files: ${items.files.length}, Folders: ${items.folders.length}`);
    } catch (error: any) {
      setMessage(`Listing failed: ${error.message}`);
    }
  }
  
  if (!isClient) {
    return <p className="p-4 text-center text-muted-foreground">Loading storage demo...</p>; 
  }

  return (
    <div className="p-4 space-y-4 border rounded-lg my-6 bg-card text-card-foreground">
      <h3 className="text-xl font-semibold text-primary flex items-center"><UploadCloud className="mr-2 h-6 w-6"/> Firebase Storage Demo</h3>
      
      <div>
        <Label htmlFor="file-upload-widget" className="block text-sm font-medium">
          Select file to upload:
        </Label>
        <Input id="file-upload-widget" type="file" onChange={handleFileChange} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="file-path-widget" className="block text-sm font-medium">
          File Path (e.g., invoices/doc.pdf or users/uid/profile.jpg):
        </Label>
        <Input 
          id="file-path-widget" 
          type="text" 
          value={filePath} 
          onChange={(e) => setFilePath(e.target.value)} 
          placeholder="test-uploads/my-image.png" 
          className="mt-1" 
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleUpload} disabled={!file}>Upload File</Button>
        <Button onClick={handleGetUrl} disabled={!filePath}>Get File URL</Button>
        <Button onClick={handleDelete} variant="destructive" disabled={!filePath}>Delete File</Button>
      </div>

      {fileUrl && (
        <div className="mt-2">
          <p className="text-sm font-medium">Last retrieved/uploaded file URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all text-sm">{fileUrl}</a>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <h4 className="text-lg font-medium">List Items in Storage Path</h4>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input 
              type="text" 
              placeholder="Path (e.g. 'invoices/' or empty for root)" 
              id="list-path-input-widget" 
              className="flex-grow"
            />
            <Button onClick={() => {
                const pathInput = document.getElementById('list-path-input-widget') as HTMLInputElement;
                handleListItems(pathInput?.value || '');
            }}>
                List
            </Button>
        </div>
        { (listedItems.files.length > 0 || listedItems.folders.length > 0) && (
          <div className="p-2 border rounded bg-muted/50 max-h-60 overflow-y-auto text-sm">
            <p><strong>Folders:</strong></p>
            {listedItems.folders.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.folders.map(folder => <li key={folder}>{folder}</li>)}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No folders found.</p>}
            <p className="mt-2"><strong>Files:</strong></p>
            {listedItems.files.length > 0 ? (
              <ul className="list-disc pl-5">
                {listedItems.files.map(f => <li key={f}>{f}</li>)}
              </ul>
            ) : <p className="text-xs text-muted-foreground">No files found.</p>}
          </div>
        )}
      </div>

      {message && (
        <p className={`mt-4 p-2 rounded text-sm ${message.includes('failed') || message.includes('Error') || message.includes('error') ? 'bg-destructive/20 text-destructive-foreground' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
