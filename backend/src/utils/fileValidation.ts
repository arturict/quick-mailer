// File validation utilities

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // PDFs
  'application/pdf',
  // Documents
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
];

// File extension to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'csv': 'text/csv',
  'zip': 'application/zip',
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileSize(size: number): FileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  return { valid: true };
}

export function validateMimeType(mimeType: string): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `File type '${mimeType}' is not allowed. Allowed types: images, PDFs, documents`,
    };
  }
  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace potentially dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .slice(0, 255); // Limit filename length
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = getFileExtension(filename);
  return EXTENSION_TO_MIME[ext] || null;
}

export function validateFile(filename: string, size: number, mimeType: string): FileValidationResult {
  // Validate size
  const sizeValidation = validateFileSize(size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Validate MIME type
  const mimeValidation = validateMimeType(mimeType);
  if (!mimeValidation.valid) {
    return mimeValidation;
  }

  // Additional validation: check if extension matches MIME type
  const expectedMimeType = getMimeTypeFromExtension(filename);
  if (expectedMimeType && expectedMimeType !== mimeType) {
    // Allow the upload but log a warning
    console.warn(`⚠️ MIME type mismatch for ${filename}: expected ${expectedMimeType}, got ${mimeType}`);
  }

  return { valid: true };
}

export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
