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

      // Convert File objects to file metadata for draft storage
      const files = []
      if (deviceData.technicalCertification) {
        files.push({
          filename: deviceData.technicalCertification.name,
          path: '', // Will be filled when files are actually uploaded
          documentType: 'technical-certification'
        })
      }
      if (deviceData.purchaseProof) {
        files.push({
          filename: deviceData.purchaseProof.name,
          path: '',
          documentType: 'purchase-proof'
        })
      }
      if (deviceData.maintenanceRecords) {
        files.push({
          filename: deviceData.maintenanceRecords.name,
          path: '',
          documentType: 'maintenance-records'
        })
      }
      deviceData.deviceImages.forEach((file, index) => {
        files.push({
          filename: file.name,
          path: '',
          documentType: 'device-images'
        })
      })

      // Create a meaningful draft name based on device name
      const draftName = deviceData.deviceName 
        ? `${deviceData.deviceName} - ${deviceData.deviceType || 'Device'}`
        : 'Untitled Draft'

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

      const requestBody = {
        draftId,
        ...draftData
      }

      console.log('Saving draft with data:', requestBody)

      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Draft API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        throw new Error(data.error || 'Failed to save draft')
      }

      return data.draft
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
      
      // Get draft directly from backend database
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/drafts/${draftId}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
        }
      })

      const data = await response.json()
      console.log('🔍 Backend API response:', data)

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
        customDeviceType: '', // Not stored in database
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
      
      const response = await fetch('/api/drafts', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
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