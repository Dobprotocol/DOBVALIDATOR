import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  storeFilesTemporarily, 
  validateFileForStorage, 
  STORAGE_CONFIG,
  StoredFile 
} from '@/lib/fileStorage'
import { getAuthenticatedUser } from '../auth/verify/route'
import { supabaseService } from '@/lib/supabase-service'

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

    // Get user by wallet address
    const user = await supabaseService.getUserByWallet(auth.user.walletAddress)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prepare submission data for Supabase
    const supabaseSubmissionData = {
      user_id: user.id,
      device_name: validatedData.deviceName,
      device_type: validatedData.deviceType,
      custom_device_type: validatedData.customDeviceType || null,
      location: validatedData.location,
      serial_number: validatedData.serialNumber,
      manufacturer: validatedData.manufacturer,
      model: validatedData.model,
      year_of_manufacture: validatedData.yearOfManufacture,
      condition: validatedData.condition,
      specifications: validatedData.specifications,
      purchase_price: validatedData.purchasePrice,
      current_value: validatedData.currentValue,
      expected_revenue: validatedData.expectedRevenue,
      operational_costs: validatedData.operationalCosts,
      status: 'PENDING',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create submission in Supabase
    const createdSubmission = await supabaseService.createSubmission(supabaseSubmissionData)
    console.log('🔍 Created submission in Supabase:', createdSubmission)

    // Delete any existing draft for this user
    try {
      const draftId = formData.get('draftId') as string
      if (draftId) {
        console.log('Deleting existing draft before submission:', draftId)
        await supabaseService.deleteDraft(draftId)
        console.log('Draft deleted successfully')
      }
    } catch (deleteError) {
      console.error('Error deleting draft:', deleteError)
      // Continue with submission even if draft deletion fails
    }

    // Return success response with submission information
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submission: {
        id: createdSubmission.id,
        deviceName: createdSubmission.device_name,
        status: createdSubmission.status,
        submittedAt: createdSubmission.submitted_at
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