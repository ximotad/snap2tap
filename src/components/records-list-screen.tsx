
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Trash2, Plus } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Inspection {
  id: string
  asset_code: string
  workflow_name: string
  created_at: string
  status: 'open' | 'closed'
  type: 'checkout' | 'return' | 'update'
}

interface RecordsListScreenProps {
  onInspectionSelect: (inspection: Inspection) => void
  onNewInspection: () => void
}

export function RecordsListScreen({ onInspectionSelect, onNewInspection }: RecordsListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; inspection: Inspection | null }>({ open: false, inspection: null })
  
  // Mock data - in real app this would come from Supabase
  const [inspections] = useState<Inspection[]>([
    {
      id: '1',
      asset_code: 'TRUCK123',
      workflow_name: 'Bronx Checkout',
      created_at: '2022-10-11T10:30:00Z',
      status: 'open',
      type: 'checkout'
    },
    {
      id: '2',
      asset_code: 'FORKLIFT9',
      workflow_name: 'Return - Avenue D',
      created_at: '2022-10-10T14:15:00Z',
      status: 'closed',
      type: 'return'
    },
    {
      id: '3',
      asset_code: 'VAN456',
      workflow_name: 'Update Inspection',
      created_at: '2022-10-09T09:45:00Z',
      status: 'closed',
      type: 'update'
    }
  ])

  const filteredInspections = inspections.filter(inspection =>
    inspection.asset_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspection.workflow_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (inspection: Inspection) => {
    setDeleteDialog({ open: true, inspection })
  }

  const confirmDelete = () => {
    // In real app, this would delete from Supabase
    console.log('Deleting inspection:', deleteDialog.inspection?.id)
    setDeleteDialog({ open: false, inspection: null })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Flete Inspection
          </h1>
          <Button
            onClick={onNewInspection}
            className="min-h-[44px] bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by asset code or workflow..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
      </div>

      {/* Inspections List */}
      <div className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Inspections ({filteredInspections.length})
        </h2>
        
        {filteredInspections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? 'No inspections match your search' : 'No inspections found'}
              </p>
              <Button
                onClick={onNewInspection}
                className="min-h-[44px] bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Inspection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInspections.map((inspection) => (
              <Card
                key={inspection.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1"
                      onClick={() => onInspectionSelect(inspection)}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {inspection.asset_code}
                        </h3>
                        <Badge 
                          variant={inspection.status === 'open' ? 'destructive' : 'default'}
                        >
                          {inspection.status === 'open' ? 'OPEN' : 'CLOSED'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {inspection.workflow_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(inspection.created_at)}
                      </p>
                    </div>
                    
                    {/* Swipe Action - Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(inspection)
                      }}
                      className="min-h-[44px] min-w-[44px] p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, inspection: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inspection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the inspection for {deleteDialog.inspection?.asset_code}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
