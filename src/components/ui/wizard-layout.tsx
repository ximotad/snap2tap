
'use client'

import { ReactNode } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface WizardLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  stepTitle: string
  onBack?: () => void
  showProgress?: boolean
}

export function WizardLayout({
  children,
  currentStep,
  totalSteps,
  stepTitle,
  onBack,
  showProgress = true
}: WizardLayoutProps) {
  const progressValue = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="min-h-[44px] min-w-[44px] p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Flete Inspection
            </h1>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} / {totalSteps}
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {stepTitle}
        </h2>
        
        {showProgress && (
          <Progress value={progressValue} className="h-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  )
}
