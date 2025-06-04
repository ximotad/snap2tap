
'use client'

import { useState } from 'react'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface TransactionTypeScreenProps {
  assetCode: string
  assetStatus: 'available' | 'out'
  hasOpenInspection: boolean
  onNext: (type: 'checkout' | 'return' | 'update') => void
  onBack: () => void
}

export function TransactionTypeScreen({
  assetCode,
  assetStatus,
  hasOpenInspection,
  onNext,
  onBack
}: TransactionTypeScreenProps) {
  const [selectedType, setSelectedType] = useState<'checkout' | 'return' | 'update' | ''>('')
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  const transactionTypes = [
    {
      value: 'return' as const,
      label: 'Return/Close',
      description: 'Close current transaction and return asset',
      disabled: !hasOpenInspection,
      disabledReason: 'No open transaction to close'
    },
    {
      value: 'update' as const,
      label: 'Add/Update',
      description: 'Add photos or update existing inspection',
      disabled: false,
      disabledReason: ''
    },
    {
      value: 'checkout' as const,
      label: 'Checkout/Open',
      description: 'Start new checkout transaction',
      disabled: false,
      disabledReason: ''
    }
  ]

  const handleTypeSelect = (type: 'checkout' | 'return' | 'update') => {
    if (type === 'checkout' && hasOpenInspection) {
      setSelectedType(type)
      setShowCloseDialog(true)
    } else {
      setSelectedType(type)
    }
  }

  const handleNext = () => {
    if (selectedType) {
      onNext(selectedType)
    }
  }

  const handleCloseAndStart = () => {
    setShowCloseDialog(false)
    onNext('checkout')
  }

  return (
    <WizardLayout
      currentStep={2}
      totalSteps={5}
      stepTitle="Transaction Type"
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Asset Status Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Asset {assetCode}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Status
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={assetStatus === 'out' ? 'destructive' : 'default'}>
                  {assetStatus.toUpperCase()}
                </Badge>
                {hasOpenInspection && (
                  <Badge variant="destructive">
                    OPEN TRANSACTION
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Transaction Type
          </h3>
          
          <RadioGroup
            value={selectedType}
            onValueChange={(value) => handleTypeSelect(value as 'checkout' | 'return' | 'update')}
            className="space-y-3"
          >
            {transactionTypes.map((type) => (
              <Card
                key={type.value}
                className={`cursor-pointer transition-colors ${
                  type.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : selectedType === type.value
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => !type.disabled && handleTypeSelect(type.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      disabled={type.disabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={type.value}
                        className={`text-base font-medium cursor-pointer ${
                          type.disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {type.label}
                      </Label>
                      <p className={`text-sm mt-1 ${
                        type.disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {type.disabled ? type.disabledReason : type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!selectedType}
          className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
        >
          Continue
        </Button>
      </div>

      {/* Close Transaction Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Current Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This asset has an open transaction. Starting a new checkout will close the current transaction and start a new one. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseAndStart}>
              Yes, Close and Start New
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WizardLayout>
  )
}
