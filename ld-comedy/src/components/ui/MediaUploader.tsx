"use client";
import { useRef, useState } from "react";
import { Button } from "./button";

interface MediaUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function MediaUploader({ onUpload, accept = "image/*,video/*", multiple = true }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFiles(files);
    onUpload(files);
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        urls.push(data.url);
      }
    }
    setUploadedUrls(urls);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        Sélectionner des médias
      </Button>
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFiles.map((file, idx) => (
            <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded">
              {file.name}
            </span>
          ))}
        </div>
      )}
      {uploading && <div className="text-amber-400">Envoi en cours...</div>}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {uploadedUrls.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline">
              {url}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
