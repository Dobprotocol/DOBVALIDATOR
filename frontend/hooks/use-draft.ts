import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { DeviceData } from '@/components/enhanced-device-verification-flow'

interface Draft {
  id: string
  name: string
  deviceName: string
  deviceType: string
  customDeviceType: string
  location: string
  yearOfManufacture: string
  condition: string
  specifications: string
  purchasePrice: string
  currentValue: string
  expectedRevenue: string
  operationalCosts: string
  files: Array<{
    filename: string
    path: string
    documentType: string
  }>
  submittedAt: string
  updatedAt: string
}

export function useDraft() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Save draft (create or update)
  const saveDraft = useCallback(async (deviceData: DeviceData, draftId?: string) => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        console.error('❌ No authentication token found')
        throw new Error('No authentication token found')
      }

      const tokenData = JSON.parse(authToken)
      console.log('🔍 Auth token data:', { 
        hasToken: !!tokenData.token, 
        walletAddress: tokenData.walletAddress,
        tokenLength: tokenData.token?.length 
      })
      
      if (!tokenData.token) {
        console.error('❌ Invalid auth token data')
        throw new Error('Invalid authentication token')
      }

      // Check if we have files to upload
      const hasFiles = deviceData.technicalCertification || 
                      deviceData.purchaseProof || 
                      deviceData.maintenanceRecords || 
                      deviceData.deviceImages.length > 0

      let response
      let data

      if (hasFiles) {
        // Save draft with files using FormData
        console.log('🔍 Saving draft with files')
        const formData = new FormData()
        
        // Add draft data fields
        const draftFields = [
          'deviceName', 'deviceType', 'location', 'serialNumber', 'manufacturer', 
          'model', 'yearOfManufacture', 'condition', 'specifications',
          'purchasePrice', 'currentValue', 'expectedRevenue', 'operationalCosts'
        ]
        
        draftFields.forEach(field => {
          const value = deviceData[field as keyof DeviceData]
          if (value !== null && value !== undefined && value !== '') {
            formData.append(field, value.toString())
          }
        })

        // Add files
        if (deviceData.technicalCertification) {
          formData.append('technicalCertification', deviceData.technicalCertification)
      }
      if (deviceData.purchaseProof) {
          formData.append('purchaseProof', deviceData.purchaseProof)
      }
      if (deviceData.maintenanceRecords) {
          formData.append('maintenanceRecords', deviceData.maintenanceRecords)
        }
        if (deviceData.deviceImages && deviceData.deviceImages.length > 0) {
      deviceData.deviceImages.forEach((file, index) => {
            formData.append(`deviceImages[${index}]`, file)
          })
        }

        if (draftId) {
          // Update existing draft with files
          console.log('🔍 Updating existing draft with files:', draftId)
          response = await fetch(`/api/drafts/${draftId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${tokenData.token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: formData
          })
        } else {
          // Create new draft with files
          console.log('🔍 Creating new draft with files')
          response = await fetch('/api/drafts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.token}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            body: formData
        })
        }
      } else {
        // Save draft without files using JSON
        console.log('🔍 Saving draft without files')

      // Only send fields that exist in the database schema
      const draftData = {
        deviceName: deviceData.deviceName || '',
        deviceType: deviceData.deviceType || '',
        location: deviceData.location || '',
        serialNumber: deviceData.serialNumber || '',
        manufacturer: deviceData.manufacturer || '',
        model: deviceData.model || '',
        yearOfManufacture: deviceData.yearOfManufacture || '',
        condition: deviceData.condition || '',
        specifications: deviceData.specifications || '',
        purchasePrice: deviceData.purchasePrice || '',
        currentValue: deviceData.currentValue || '',
        expectedRevenue: deviceData.expectedRevenue || '',
        operationalCosts: deviceData.operationalCosts || '',
      }

      if (draftId) {
        // Update existing draft
        console.log('🔍 Updating existing draft:', draftId)
        response = await fetch(`/api/drafts/${draftId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(draftData)
        })
      } else {
        // Create new draft
        console.log('🔍 Creating new draft')
        response = await fetch('/api/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(draftData)
        })
        }
      }

      data = await response.json()

      if (!response.ok) {
        console.error('Draft API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        throw new Error(data.error || 'Failed to save draft')
      }

      console.log('✅ Draft saved successfully:', data)
      
      // Return the draft data with the ID
      return data.draft || data
    } catch (error: any) {
      console.error('Error saving draft:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Load draft by ID
  const loadDraft = useCallback(async (draftId: string): Promise<DeviceData | null> => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const tokenData = JSON.parse(authToken)
      
      console.log('🔍 Loading draft with ID:', draftId)
      
      // Get draft from Next.js API route
      const response = await fetch(`/api/drafts/${draftId}?v=2`, {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      const data = await response.json()
      console.log('🔍 API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load draft')
      }

      console.log('🔍 Found draft:', data.draft)
      
      if (!data.draft) {
        console.log('🔍 Draft not found')
        throw new Error('Draft not found')
      }

      // Convert draft back to DeviceData format
      // Note: Files will need to be re-uploaded since we can't store File objects
      const deviceData: DeviceData = {
        deviceName: data.draft.deviceName || '',
        deviceType: data.draft.deviceType || '',
        location: data.draft.location || '', // Now stored in database
        serialNumber: data.draft.serialNumber || '',
        manufacturer: data.draft.manufacturer || '',
        model: data.draft.model || '',
        yearOfManufacture: data.draft.yearOfManufacture || '',
        condition: data.draft.condition || '',
        specifications: data.draft.specifications || '',
        purchasePrice: data.draft.purchasePrice || '',
        currentValue: data.draft.currentValue || '',
        expectedRevenue: data.draft.expectedRevenue || '',
        operationalCosts: data.draft.operationalCosts || '',
        technicalCertification: null, // Will need to be re-uploaded
        purchaseProof: null, // Will need to be re-uploaded
        maintenanceRecords: null, // Will need to be re-uploaded
        deviceImages: [], // Will need to be re-uploaded
      }

      console.log('🔍 Converted device data:', deviceData)

      toast({
        title: "Draft Loaded",
        description: "Draft loaded successfully. Please re-upload any files.",
      })

      return deviceData
    } catch (error: any) {
      console.error('Error loading draft:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to load draft',
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Get user's drafts
  const getDrafts = useCallback(async (): Promise<Draft[]> => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const tokenData = JSON.parse(authToken)
      
      const response = await fetch('/api/drafts?v=2', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load drafts')
      }

      return data.drafts
    } catch (error: any) {
      console.error('Error loading drafts:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to load drafts',
        variant: "destructive",
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [toast])

  return {
    saveDraft,
    loadDraft,
    getDrafts,
    loading
  }
} 