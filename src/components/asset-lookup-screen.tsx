
'use client'

import { useState } from 'react'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Scan, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface OpenInspection {
  id: string
  workflow_name: string
  created_at: string
  type: string
}

interface AssetLookupScreenProps {
  onNext: (assetId: string, selectedInspection?: OpenInspection) => void
}

export function AssetLookupScreen({ onNext }: AssetLookupScreenProps) {
  const [assetCode, setAssetCode] = useState('')
  const [openInspections, setOpenInspections] = useState<OpenInspection[]>([
    {
      id: '1',
      workflow_name: 'Bronx Checkout',
      created_at: '2022-10-11T10:30:00Z',
      type: 'checkout'
    }
  ])
  const [selectedInspection, setSelectedInspection] = useState<OpenInspection | null>(null)
  const [loading, setLoading] = useState(false)

  const handleScan = () => {
    // In a real app, this would open camera for barcode scanning
    toast({
      title: "Scanner Ready",
      description: "Barcode scanner would open here. For demo, enter 'TRUCK123' or 'FORKLIFT9'",
    })
  }

  const handleLookup = async () => {
    if (!assetCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an asset ID",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      if (assetCode.toUpperCase() === 'TRUCK123') {
        setOpenInspections([
          {
            id: '1',
            workflow_name: 'Bronx Checkout',
            created_at: '2022-10-11T10:30:00Z',
            type: 'checkout'
          }
        ])
      } else {
        setOpenInspections([])
      }
      setLoading(false)
    }, 1000)
  }

  const handleContinue = () => {
    if (selectedInspection) {
      onNext(assetCode, selectedInspection)
    }
  }

  const handleStartNew = () => {
    onNext(assetCode)
  }

  return (
    <WizardLayout
      currentStep={1}
      totalSteps={5}
      stepTitle="Asset Lookup"
    >
      <div className="space-y-6">
        {/* Asset ID Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter or Scan Asset ID
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Asset ID (e.g., TRUCK123)"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              className="flex-1 min-h-[44px]"
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
            <Button
              variant="outline"
              onClick={handleScan}
              className="min-h-[44px] min-w-[44px] p-2"
            >
              <Scan className="h-5 w-5" />
            </Button>
          </div>
          <Button
            onClick={handleLookup}
            disabled={!assetCode.trim() || loading}
            className="w-full min-h-[44px]"
          >
            {loading ? 'Looking up...' : 'Lookup Asset'}
          </Button>
        </div>

        {/* Open Inspections */}
        {assetCode && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open Inspections for {assetCode.toUpperCase()}
            </h3>
            
            {openInspections.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No open inspections found
                  </p>
                  <Button
                    onClick={handleStartNew}
                    className="min-h-[44px] bg-blue-600 hover:bg-blue-700"
                  >
                    Start New Inspection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {openInspections.map((inspection) => (
                    <Card
                      key={inspection.id}
                      className={`cursor-pointer transition-colors min-h-[60px] ${
                        selectedInspection?.id === inspection.id
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedInspection(inspection)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {inspection.workflow_name}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(inspection.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant="destructive">
                            OPEN TRANSACTION
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleContinue}
                    disabled={!selectedInspection}
                    className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700"
                  >
                    Continue Selected
                  </Button>
                  <Button
                    onClick={handleStartNew}
                    variant="outline"
                    className="flex-1 min-h-[44px]"
                  >
                    Start New
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </WizardLayout>
  )
}
