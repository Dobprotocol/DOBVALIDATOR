import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { DeviceData } from '@/components/device-verification-flow'

interface Draft {
  id: string
  deviceName: string
  deviceType: string
  serialNumber: string
  manufacturer: string
  model: string
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
        throw new Error('No authentication token found')
      }

      const tokenData = JSON.parse(authToken)
      
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

      const requestBody = {
        draftId,
        ...deviceData,
        files
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

      toast({
        title: "Draft Saved",
        description: draftId ? "Draft updated successfully" : "Draft saved successfully",
      })

      return data.draft
    } catch (error: any) {
      console.error('Error saving draft:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to save draft',
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load draft by ID
  const loadDraft = useCallback(async (draftId: string): Promise<DeviceData | null> => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        throw new Error('No authentication token found')
      }

      const tokenData = JSON.parse(authToken)
      
      // Get all drafts and find the specific one
      const response = await fetch('/api/drafts', {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load drafts')
      }

      const draft = data.drafts.find((d: Draft) => d.id === draftId)
      if (!draft) {
        throw new Error('Draft not found')
      }

      // Convert draft back to DeviceData format
      // Note: Files will need to be re-uploaded since we can't store File objects
      const deviceData: DeviceData = {
        deviceName: draft.deviceName,
        deviceType: draft.deviceType,
        serialNumber: draft.serialNumber,
        manufacturer: draft.manufacturer,
        model: draft.model,
        yearOfManufacture: draft.yearOfManufacture,
        condition: draft.condition,
        specifications: draft.specifications,
        purchasePrice: draft.purchasePrice,
        currentValue: draft.currentValue,
        expectedRevenue: draft.expectedRevenue,
        operationalCosts: draft.operationalCosts,
        technicalCertification: null, // Will need to be re-uploaded
        purchaseProof: null, // Will need to be re-uploaded
        maintenanceRecords: null, // Will need to be re-uploaded
        deviceImages: [], // Will need to be re-uploaded
      }

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