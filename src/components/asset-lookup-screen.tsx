'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scan, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface AssetLookupScreenProps {
  onNext: (assetCode: string, selectedInspection?: any) => void
}

export function AssetLookupScreen({ onNext }: AssetLookupScreenProps) {
  const [assetCode, setAssetCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recentAssets, setRecentAssets] = useState([
    { code: 'TRUCK123', lastUsed: '2 hours ago' },
    { code: 'TRAILER456', lastUsed: '1 day ago' },
    { code: 'FORKLIFT789', lastUsed: '3 days ago' },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assetCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an asset code",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Add to recent assets if not already there
      if (!recentAssets.some(asset => asset.code === assetCode)) {
        setRecentAssets(prev => [
          { code: assetCode, lastUsed: 'just now' },
          ...prev.slice(0, 4)
        ])
      }
      
      onNext(assetCode)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find asset. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScanBarcode = () => {
    // In a real app, this would trigger the device camera for barcode scanning
    toast({
      title: "Barcode Scanner",
      description: "Barcode scanning would open here in the real app"
    })
  }

  const handleRecentAssetClick = (code: string) => {
    setAssetCode(code)
  }

  return (
    <WizardLayout
      currentStep={1}
      totalSteps={5}
      stepTitle="Asset Lookup"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter asset code or scan barcode"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              className="flex-1 min-h-[44px]"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleScanBarcode}
              className="min-h-[44px] min-w-[44px] p-2"
              disabled={isLoading}
            >
              <Scan className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full min-h-[44px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Find Asset</span>
              </div>
            )}
          </Button>
        </form>

        {recentAssets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAssets.map((asset) => (
                  <div 
                    key={asset.code}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleRecentAssetClick(asset.code)}
                  >
                    <div className="font-medium">{asset.code}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{asset.lastUsed}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </WizardLayout>
  )
}
