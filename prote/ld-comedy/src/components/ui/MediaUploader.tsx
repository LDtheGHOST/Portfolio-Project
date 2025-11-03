"use client";
import { useRef, useState } from "react";
import { Button } from "./button";

interface MediaUploaderProps {
  onUpload?: (files: File[]) => void; // Callback immédiat avec les fichiers
  onUploadSuccess?: (url: string) => void; // Callback après upload réussi avec l'URL
  accept?: string;
  multiple?: boolean;
}

export default function MediaUploader({
  onUpload,
  onUploadSuccess,
  accept = "image/*,video/*",
  multiple = true
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setSelectedFiles(files);
    setError("");

    // Callback immédiat avec les fichiers (optionnel)
    if (onUpload) {
      onUpload(files);
    }

    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.url) {
          urls.push(data.url);
          // Callback après upload réussi avec l'URL
          if (onUploadSuccess) {
            onUploadSuccess(data.url);
          }
        } else if (data.error) {
          throw new Error(data.error);
        }
      }
      setUploadedUrls(urls);
    } catch (err) {
      console.error("Erreur upload:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      // Réinitialiser l'input pour permettre le réupload du même fichier
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
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
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Upload en cours...
          </span>
        ) : (
          "Sélectionner des médias"
        )}
      </Button>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {selectedFiles.length > 0 && !uploading && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, idx) => (
            <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
              {file.name}
            </span>
          ))}
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedUrls.map((url, idx) => (
            <div key={idx} className="text-xs bg-green-500/10 border border-green-500/30 px-2 py-1 rounded text-green-400">
              ✓ Fichier uploadé
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
