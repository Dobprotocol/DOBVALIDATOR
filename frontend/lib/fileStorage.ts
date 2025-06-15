import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

// Types for file storage
export interface StoredFile {
  filename: string
  path: string
  size: number
  mimeType: string
  metadata: {
    originalName: string
    uploadDate: string
    operatorId: string
    documentType: string
  }
}

export interface StorageResult {
  success: boolean
  error?: string
  file?: StoredFile
}

// Storage configuration
export const STORAGE_CONFIG = {
  baseDir: process.env.UPLOAD_DIR || 'uploads',
  tempDir: 'temp',
  permanentDir: 'permanent',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: {
    pdf: ['application/pdf'],
    images: ['image/jpeg', 'image/png'],
  }
}

// Ensure directory exists
async function ensureDirectoryExists(path: string) {
  try {
    await mkdir(path, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

// Store file in temporary location
export async function storeFileTemporarily(
  file: File,
  operatorId: string,
  documentType: string
): Promise<StorageResult> {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = join(STORAGE_CONFIG.baseDir, STORAGE_CONFIG.tempDir)
    await ensureDirectoryExists(tempDir)

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}-${operatorId}-${documentType}.${file.name.split('.').pop()}`
    const filepath = join(tempDir, filename)

    // Convert File to Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filepath, buffer)

    return {
      success: true,
      file: {
        filename,
        path: filepath,
        size: file.size,
        mimeType: file.type,
        metadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
          operatorId,
          documentType
        }
      }
    }
  } catch (error) {
    console.error('Error storing file:', error)
    return {
      success: false,
      error: 'Failed to store file'
    }
  }
}

// Store multiple files temporarily
export async function storeFilesTemporarily(
  files: File[],
  operatorId: string,
  documentType: string
): Promise<StorageResult[]> {
  return Promise.all(
    files.map(file => storeFileTemporarily(file, operatorId, documentType))
  )
}

// Clean up temporary files (to be implemented by backend)
export async function cleanupTempFiles(filepaths: string[]): Promise<void> {
  // This will be implemented by the backend
  console.log('Files to clean up:', filepaths)
}

// Move files to permanent storage (to be implemented by backend)
export async function moveToPermanentStorage(
  tempFilepaths: string[],
  operatorId: string
): Promise<void> {
  // This will be implemented by the backend
  console.log('Files to move to permanent storage:', tempFilepaths)
}

// Get file metadata (to be implemented by backend)
export async function getFileMetadata(filepath: string): Promise<StoredFile | null> {
  // This will be implemented by the backend
  return null
}

// Validate file before storage
export function validateFileForStorage(
  file: File,
  allowedTypes: string[],
  maxSize: number = STORAGE_CONFIG.maxFileSize
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  return { valid: true }
} 