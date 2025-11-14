import { useState, useRef } from 'react';
import { AttachmentData } from '../api';

interface FileUploadProps {
  onFilesChange: (files: AttachmentData[]) => void;
  maxFileSize?: number; // in bytes
}

export function FileUpload({ onFilesChange, maxFileSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [files, setFiles] = useState<AttachmentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(e.target.files || []);

    for (const file of selectedFiles) {
      // Validate file size
      if (file.size > maxFileSize) {
        setError(`File "${file.name}" exceeds the maximum size of ${formatFileSize(maxFileSize)}`);
        return;
      }

      // Convert file to base64
      try {
        const base64Content = await fileToBase64(file);
        const newFile: AttachmentData = {
          filename: file.name,
          content: base64Content.split(',')[1], // Remove data:type/subtype;base64, prefix
          contentType: file.type || 'application/octet-stream',
        };

        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
      } catch (err) {
        setError(`Failed to process file "${file.name}"`);
        console.error('File processing error:', err);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileSizeFromBase64 = (base64: string): number => {
    // Estimate size from base64 string
    return Math.ceil((base64.length * 3) / 4);
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">📎 Attachments (optional)</span>
        <span className="label-text-alt">Max {formatFileSize(maxFileSize)} per file</span>
      </label>

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
          multiple
        />

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Selected files ({files.length}):</div>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.filename}</div>
                    <div className="text-xs text-base-content/70">
                      {formatFileSize(getFileSizeFromBase64(file.content))} • {file.contentType}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.filename}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
