
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  tag_label?: string
  taken_at: string
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

interface RecordDetailScreenProps {
  inspection: Inspection
  onBack: () => void
  onCloseTransaction?: () => void
}

export function RecordDetailScreen({ 
  inspection, 
  onBack, 
  onCloseTransaction 
}: RecordDetailScreenProps) {
  // Mock media data - in real app this would come from Supabase
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'photo',
      url: '/api/placeholder/400/300',
      taken_at: '2022-10-11T10:35:00Z'
    },
    {
      id: '2',
      type: 'video',
      url: '/api/placeholder/400/300',
      taken_at: '2022-10-11T10:40:00Z'
    },
    {
      id: '3',
      type: 'photo',
      url: '/api/placeholder/400/300',
      tag_label: '15s',
      taken_at: '2022-10-11T10:42:00Z'
    }
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const showCloseButton = inspection.status === 'open' && inspection.type === 'checkout'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Badge variant={inspection.status === 'open' ? 'destructive' : 'default'}>
              {inspection.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {inspection.asset_code}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {inspection.workflow_name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(inspection.created_at)}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Media Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Media Gallery ({mediaItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {mediaItems.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                      {item.type === 'photo' ? (
                        <img
                          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop"
                          alt="Inspection photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      
                      {item.tag_label && (
                        <Badge className="absolute top-2 left-2 text-xs">
                          {item.tag_label}
                        </Badge>
                      )}
                      
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl">
                    <div className="aspect-video bg-black rounded overflow-hidden">
                      {item.type === 'photo' ? (
                        <img
                          src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop"
                          alt="Inspection photo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist Information */}
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Truck Type:</span>
                <p className="font-medium">Box Truck</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Vehicle #:</span>
                <p className="font-medium">TRK-001</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Customer:</span>
                <p className="font-medium">ABC Company</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">RA #:</span>
                <p className="font-medium">RA-12345</p>
              </div>
            </div>
            
            {inspection.type === 'checkout' && (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date Out:</span>
                  <p className="font-medium">Oct 11, 2022</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Time Out:</span>
                  <p className="font-medium">10:30 AM</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Miles Out:</span>
                  <p className="font-medium">45,231</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Fuel Level:</span>
                  <p className="font-medium">Full</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Digital Signature */}
        {inspection.signature_path && (
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[150px] flex items-center justify-center">
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgNTAgUTUwIDEwIDEwMCA1MCBUMTkwIDUwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4="
                  alt="Digital signature"
                  className="max-w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Close Transaction Button (for open checkouts) */}
        {showCloseButton && (
          <div className="sticky bottom-4">
            <Button
              onClick={onCloseTransaction}
              className="w-full min-h-[44px] bg-green-600 hover:bg-green-700"
            >
              Close Transaction
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
