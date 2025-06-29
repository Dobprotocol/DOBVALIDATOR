
"use client"

import { useEffect, useState } from "react"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const authToken = localStorage.getItem('authToken')
    const stellarPublicKey = localStorage.getItem('stellarPublicKey')
    
    let parsedAuth = null
    if (authToken) {
      try {
        parsedAuth = JSON.parse(authToken)
      } catch (e) {
        parsedAuth = { error: 'Failed to parse' }
      }
    }

    setDebugInfo({
      authToken: authToken,
      stellarPublicKey: stellarPublicKey,
      parsedAuth: parsedAuth,
      timestamp: new Date().toISOString(),
      isExpired: parsedAuth?.expiresAt ? parsedAuth.expiresAt < Date.now() : null
    })
  }, [])

  const clearStorage = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('stellarPublicKey')
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">LocalStorage Contents:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <button 
        onClick={clearStorage}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Clear Storage
      </button>
    </div>
  )
} 