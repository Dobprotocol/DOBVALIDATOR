import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  storeFilesTemporarily, 
  validateFileForStorage, 
  STORAGE_CONFIG,
  StoredFile 
} from '@/lib/fileStorage'
import { getAuthenticatedUser } from '../auth/verify/route'
import { submissionStorage } from '@/lib/submission-storage'

// Define validation schemas
const deviceSchema = z.object({
  // Basic info
  deviceName: z.string().min(2, "Device name must be at least 2 characters"),
  deviceType: z.string().min(1, "Device type is required"),
  customDeviceType: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),

  // Technical info
  serialNumber: z.string().min(3, "Serial number must be at least 3 characters"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z.string().regex(/^\d{4}$/, "Invalid year format"),
  condition: z.string().min(1, "Condition is required"),
  specifications: z.string().min(10, "Specifications must be at least 10 characters"),

  // Financial info
  purchasePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Purchase price must be greater than 0"
  }),
  currentValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Current value must be greater than or equal to 0"
  }),
  expectedRevenue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Expected revenue must be greater than or equal to 0"
  }),
  operationalCosts: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Operational costs must be greater than or equal to 0"
  }),
})

// File validation helper
const validateFile = async (file: File, options: {
  maxSize: number,
  allowedTypes: string[],
  required: boolean
}) => {
  if (!file && options.required) {
    return { valid: false, error: "File is required" }
  }
  if (!file) {
    return { valid: true }
  }

  if (file.size > options.maxSize) {
    return { valid: false, error: `File size exceeds ${options.maxSize / (1024 * 1024)}MB limit` }
  }

  const fileType = file.type.toLowerCase()
  if (!options.allowedTypes.includes(fileType)) {
    return { valid: false, error: `File type ${fileType} is not allowed` }
  }

  // Additional PDF validation
  if (fileType === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      // Check PDF magic number
      const isPDF = uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46
      if (!isPDF) {
        return { valid: false, error: "Invalid PDF file" }
      }
    } catch (error) {
      return { valid: false, error: "Error validating PDF file" }
    }
  }

  return { valid: true }
}

// Helper function to validate files
async function validateFiles(files: File[], allowedTypes: string[], maxSize: number = STORAGE_CONFIG.maxFileSize) {
  const errors: string[] = []
  const validFiles: File[] = []

  for (const file of files) {
    const validation = validateFileForStorage(file, allowedTypes, maxSize)
    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`)
    } else {
      validFiles.push(file)
    }
  }

  return { errors, validFiles }
}

// Helper function to validate PDF files
async function validatePdfFiles(files: File[]) {
  return validateFiles(files, STORAGE_CONFIG.allowedMimeTypes.pdf)
}

// Helper function to validate image files
async function validateImageFiles(files: File[]) {
  return validateFiles(files, STORAGE_CONFIG.allowedMimeTypes.images)
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = getAuthenticatedUser(request)
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    
    console.log('🔍 Received form data:', data)
    console.log('🔍 Form data keys:', Object.keys(data))
    console.log('🔍 Device name:', data.deviceName)
    console.log('🔍 Device type:', data.deviceType)
    console.log('🔍 Serial number:', data.serialNumber)
    console.log('🔍 Manufacturer:', data.manufacturer)
    console.log('🔍 Model:', data.model)
    
    // Validate form data
    const validationResult = deviceSchema.safeParse(data)
    if (!validationResult.success) {
      console.log('🔍 Validation failed:', validationResult.error.format())
      return NextResponse.json(
        { error: 'Invalid form data', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    const operatorId = auth.user.walletAddress
    const storedFiles: StoredFile[] = []

    // Handle technical certification
    const technicalCert = formData.get('technicalCertification') as File
    if (technicalCert) {
      const { errors, validFiles } = await validatePdfFiles([technicalCert])
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid technical certification', details: errors },
          { status: 400 }
        )
      }
      const result = await storeFilesTemporarily(validFiles, operatorId, 'technical-certification')
      if (result[0].file) storedFiles.push(result[0].file)
    }

    // Handle purchase proof
    const purchaseProof = formData.get('purchaseProof') as File
    if (purchaseProof) {
      const { errors, validFiles } = await validatePdfFiles([purchaseProof])
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid purchase proof', details: errors },
          { status: 400 }
        )
      }
      const result = await storeFilesTemporarily(validFiles, operatorId, 'purchase-proof')
      if (result[0].file) storedFiles.push(result[0].file)
    }

    // Handle maintenance records
    const maintenanceRecords = formData.getAll('maintenanceRecords') as File[]
    if (maintenanceRecords.length > 0) {
      const { errors, validFiles } = await validatePdfFiles(maintenanceRecords)
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid maintenance records', details: errors },
          { status: 400 }
        )
      }
      const results = await storeFilesTemporarily(validFiles, operatorId, 'maintenance-records')
      storedFiles.push(...results.filter(r => r.file).map(r => r.file!))
    }

    // Handle device images
    const deviceImages = formData.getAll('deviceImages') as File[]
    if (deviceImages.length > 0) {
      const { errors, validFiles } = await validateImageFiles(deviceImages)
      if (errors.length > 0) {
        return NextResponse.json(
          { error: 'Invalid device images', details: errors },
          { status: 400 }
        )
      }
      const results = await storeFilesTemporarily(validFiles, operatorId, 'device-images')
      storedFiles.push(...results.filter(r => r.file).map(r => r.file!))
    }

    // Create submission record
    const submissionId = `SUB_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const submission = {
      id: submissionId,
      deviceName: validatedData.deviceName,
      deviceType: validatedData.deviceType,
      customDeviceType: validatedData.customDeviceType,
      location: validatedData.location,
      serialNumber: validatedData.serialNumber,
      manufacturer: validatedData.manufacturer,
      model: validatedData.model,
      yearOfManufacture: validatedData.yearOfManufacture,
      condition: validatedData.condition,
      specifications: validatedData.specifications,
      purchasePrice: validatedData.purchasePrice,
      currentValue: validatedData.currentValue,
      expectedRevenue: validatedData.expectedRevenue,
      operationalCosts: validatedData.operationalCosts,
      operatorWallet: auth.user.walletAddress,
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: storedFiles.map(file => ({
        filename: file.filename,
        path: file.path,
        documentType: file.metadata.documentType
      })),
      // Admin fields (only for admin users)
      adminNotes: null,
      adminScore: null,
      adminDecision: null,
      adminDecisionAt: null,
      certificateId: null,
    }

    // Store the submission in frontend storage
    const createdSubmission = submissionStorage.create(submission)

    // Also send to backend database
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        console.log('Sending submission to backend database...')
        
        const backendResponse = await fetch('http://localhost:3001/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            deviceName: validatedData.deviceName,
            deviceType: validatedData.deviceType,
            customDeviceType: validatedData.customDeviceType,
            location: validatedData.location,
            serialNumber: validatedData.serialNumber,
            manufacturer: validatedData.manufacturer,
            model: validatedData.model,
            yearOfManufacture: validatedData.yearOfManufacture,
            condition: validatedData.condition,
            specifications: validatedData.specifications,
            purchasePrice: validatedData.purchasePrice,
            currentValue: validatedData.currentValue,
            expectedRevenue: validatedData.expectedRevenue,
            operationalCosts: validatedData.operationalCosts,
            files: storedFiles.map(file => ({
              filename: file.filename,
              path: file.path,
              documentType: file.metadata.documentType
            }))
          })
        })

        if (backendResponse.ok) {
          const backendData = await backendResponse.json()
          console.log('Backend submission response:', backendData)
        } else {
          console.error('Backend submission failed:', backendResponse.status, backendResponse.statusText)
        }
      }
    } catch (backendError) {
      console.error('Error sending to backend:', backendError)
      // Don't fail the submission if backend is down, just log the error
    }

    // Return success response with submission information
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submission: {
        id: createdSubmission.id,
        deviceName: createdSubmission.deviceName,
        status: createdSubmission.status,
        submittedAt: createdSubmission.submittedAt
      },
      data: {
        ...validatedData,
        files: storedFiles.map(file => ({
          filename: file.filename,
          path: file.path,
          documentType: file.metadata.documentType
        }))
      }
    })

  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 