import { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
];

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUpload({ files, onChange, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: File type not allowed. Allowed: images, PDFs, documents`;
    }
    return null;
  }, []);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    let errorMessage: string | null = null;

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessage = validationError;
        break;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      return;
    }

    onChange([...files, ...validFiles]);
    setError(null);
  }, [files, onChange, validateFile, disabled]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  }, [files, onChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📄';
    } else if (file.type.includes('word')) {
      return '📝';
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      return '📊';
    } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
      return '📽️';
    } else if (file.type.includes('zip')) {
      return '🗜️';
    }
    return '📎';
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-base-300 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
          accept={ALLOWED_TYPES.join(',')}
        />
        
        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-primary' : 'text-base-content/50'}`} />
          <p className="text-sm font-medium mb-1">
            {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-base-content/60">
            Images, PDFs, Documents (Max 10MB per file)
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-error"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium">Attached Files ({files.length})</p>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-base-content/60">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="btn btn-ghost btn-sm btn-circle"
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
