
'use client'

import { useState, useRef } from 'react'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import SignatureCanvas from 'react-signature-canvas'

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
}

interface ChecklistData {
  truckType: string
  vehicleNumber: string
  customer: string
  [key: string]: any
}

interface ReviewAndSignScreenProps {
  assetCode: string
  transactionType: 'checkout' | 'return' | 'update'
  mediaItems: MediaItem[]
  checklistData: ChecklistData
  onSubmit: (recipientEmails: string[], signatureData: string) => void
  onBack: () => void
}

export function ReviewAndSignScreen({
  assetCode,
  transactionType,
  mediaItems,
  checklistData,
  onSubmit,
  onBack
}: ReviewAndSignScreenProps) {
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signatureRef = useRef<SignatureCanvas>(null)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }
    
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }
    
    if (recipientEmails.includes(email)) {
      toast({
        title: "Error",
        description: "This email is already added",
        variant: "destructive"
      })
      return
    }
    
    setRecipientEmails(prev => [...prev, email])
    setEmailInput('')
  }

  const removeEmail = (email: string) => {
    setRecipientEmails(prev => prev.filter(e => e !== email))
  }

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const handleSubmit = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        title: "Signature Required",
        description: "Please provide a signature before submitting",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const signatureData = signatureRef.current.toDataURL()
      await onSubmit(recipientEmails, signatureData)
      
      toast({
        title: "Success!",
        description: "Inspection is uploading in the background",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inspection. Please try again.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const getWorkflowName = () => {
    switch (transactionType) {
      case 'checkout': return 'Checkout Transaction'
      case 'return': return 'Return Transaction'
      case 'update': return 'Update/Add Media'
      default: return 'Inspection'
    }
  }

  return (
    <WizardLayout
      currentStep={5}
      totalSteps={5}
      stepTitle="Review & Sign"
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Inspection Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Asset:</span>
              <span className="font-medium">{assetCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
              <Badge variant="outline">{getWorkflowName()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Media Items:</span>
              <span className="font-medium">{mediaItems.length} items</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Customer:</span>
              <span className="font-medium">{checklistData.customer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Vehicle:</span>
              <span className="font-medium">{checklistData.vehicleNumber}</span>
            </div>
          </CardContent>
        </Card>

        {/* Media Preview */}
        {mediaItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Captured Media ({mediaItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {mediaItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                    {item.type === 'photo' ? (
                      <img
                        src={item.url}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
                {mediaItems.length > 8 && (
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      +{mediaItems.length - 8}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipient Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Email Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                className="flex-1 min-h-[44px]"
              />
              <Button
                onClick={addEmail}
                variant="outline"
                className="min-h-[44px] min-w-[44px] p-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {recipientEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipientEmails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center space-x-2 px-3 py-1"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Digital Signature *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 150,
                  className: 'signature-canvas w-full'
                }}
                backgroundColor="rgba(255,255,255,0.8)"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign above with your finger or stylus
              </p>
              <Button
                onClick={clearSignature}
                variant="outline"
                size="sm"
                className="min-h-[44px]"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Inspection...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Submit Inspection</span>
            </div>
          )}
        </Button>
      </div>
    </WizardLayout>
  )
}
