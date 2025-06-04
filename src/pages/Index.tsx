
'use client'

import { useState } from 'react'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { AssetLookupScreen } from '@/components/asset-lookup-screen'
import { TransactionTypeScreen } from '@/components/transaction-type-screen'
import { MediaCaptureScreen } from '@/components/media-capture-screen'
import { ChecklistScreen } from '@/components/checklist-screen'
import { ReviewAndSignScreen } from '@/components/review-and-sign-screen'
import { RecordsListScreen } from '@/components/records-list-screen'
import { RecordDetailScreen } from '@/components/record-detail-screen'

type Screen = 
  | 'records-list'
  | 'asset-lookup' 
  | 'transaction-type'
  | 'media-capture'
  | 'checklist'
  | 'review-sign'
  | 'record-detail'

interface InspectionData {
  assetCode: string
  assetStatus: 'available' | 'out'
  hasOpenInspection: boolean
  selectedInspection?: any
  transactionType?: 'checkout' | 'return' | 'update'
  mediaItems: any[]
  checklistData?: any
}

interface Inspection {
  id: string
  asset_code: string
  workflow_name: string
  type: 'checkout' | 'return' | 'update'
  status: 'open' | 'closed'
  created_at: string
  checklist_json: any
  signature_path?: string
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('records-list')
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [inspectionData, setInspectionData] = useState<InspectionData>({
    assetCode: '',
    assetStatus: 'available',
    hasOpenInspection: false,
    mediaItems: []
  })

  // Asset Lookup Screen handlers
  const handleAssetLookup = (assetCode: string, selectedInspection?: any) => {
    setInspectionData(prev => ({
      ...prev,
      assetCode,
      assetStatus: assetCode === 'TRUCK123' ? 'out' : 'available',
      hasOpenInspection: !!selectedInspection,
      selectedInspection
    }))
    setCurrentScreen('transaction-type')
  }

  // Transaction Type Screen handlers
  const handleTransactionTypeSelect = (type: 'checkout' | 'return' | 'update') => {
    setInspectionData(prev => ({ ...prev, transactionType: type }))
    setCurrentScreen('media-capture')
  }

  // Media Capture Screen handlers
  const handleMediaCapture = (mediaItems: any[]) => {
    setInspectionData(prev => ({ ...prev, mediaItems }))
    setCurrentScreen('checklist')
  }

  // Checklist Screen handlers
  const handleChecklistComplete = (checklistData: any) => {
    setInspectionData(prev => ({ ...prev, checklistData }))
    setCurrentScreen('review-sign')
  }

  // Review & Sign Screen handlers
  const handleInspectionSubmit = async (recipientEmails: string[], signatureData: string) => {
    console.log('Submitting inspection:', {
      ...inspectionData,
      recipientEmails,
      signatureData
    })
    
    // Simulate API submission
    setTimeout(() => {
      setCurrentScreen('records-list')
      setInspectionData({
        assetCode: '',
        assetStatus: 'available',
        hasOpenInspection: false,
        mediaItems: []
      })
    }, 2000)
  }

  // Records List Screen handlers
  const handleInspectionSelect = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setCurrentScreen('record-detail')
  }

  const handleNewInspection = () => {
    setCurrentScreen('asset-lookup')
  }

  // Record Detail Screen handlers
  const handleCloseTransaction = () => {
    if (selectedInspection) {
      setInspectionData(prev => ({
        ...prev,
        assetCode: selectedInspection.asset_code,
        assetStatus: 'out',
        hasOpenInspection: true,
        transactionType: 'return'
      }))
      setCurrentScreen('media-capture')
    }
  }

  // Navigation handlers
  const handleBack = () => {
    switch (currentScreen) {
      case 'asset-lookup':
        setCurrentScreen('records-list')
        break
      case 'transaction-type':
        setCurrentScreen('asset-lookup')
        break
      case 'media-capture':
        setCurrentScreen('transaction-type')
        break
      case 'checklist':
        setCurrentScreen('media-capture')
        break
      case 'review-sign':
        setCurrentScreen('checklist')
        break
      case 'record-detail':
        setCurrentScreen('records-list')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OfflineBanner />
      
      {currentScreen === 'records-list' && (
        <RecordsListScreen
          onInspectionSelect={handleInspectionSelect}
          onNewInspection={handleNewInspection}
        />
      )}

      {currentScreen === 'asset-lookup' && (
        <AssetLookupScreen
          onNext={handleAssetLookup}
        />
      )}

      {currentScreen === 'transaction-type' && (
        <TransactionTypeScreen
          assetCode={inspectionData.assetCode}
          assetStatus={inspectionData.assetStatus}
          hasOpenInspection={inspectionData.hasOpenInspection}
          onNext={handleTransactionTypeSelect}
          onBack={handleBack}
        />
      )}

      {currentScreen === 'media-capture' && (
        <MediaCaptureScreen
          onNext={handleMediaCapture}
          onBack={handleBack}
        />
      )}

      {currentScreen === 'checklist' && inspectionData.transactionType && (
        <ChecklistScreen
          transactionType={inspectionData.transactionType}
          onNext={handleChecklistComplete}
          onBack={handleBack}
        />
      )}

      {currentScreen === 'review-sign' && inspectionData.transactionType && (
        <ReviewAndSignScreen
          assetCode={inspectionData.assetCode}
          transactionType={inspectionData.transactionType}
          mediaItems={inspectionData.mediaItems}
          checklistData={inspectionData.checklistData}
          onSubmit={handleInspectionSubmit}
          onBack={handleBack}
        />
      )}

      {currentScreen === 'record-detail' && selectedInspection && (
        <RecordDetailScreen
          inspection={selectedInspection}
          onBack={() => setCurrentScreen('records-list')}
          onCloseTransaction={handleCloseTransaction}
        />
      )}
    </div>
  )
}

export default Index
