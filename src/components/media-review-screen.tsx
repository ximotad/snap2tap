import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Re-declare MediaItem type for now; ideally import from media-capture-screen
interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  uploading: boolean
  uploaded: boolean
  tagTimestamp?: string
}

interface MediaReviewScreenProps {
  mediaItems: MediaItem[]
  onRestart: () => void
  onConfirm: (mediaItems: MediaItem[]) => void
}

export function MediaReviewScreen({ mediaItems: initialMedia, onRestart, onConfirm }: MediaReviewScreenProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia)

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Review Media</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-2">Delete any photos or videos you don't want to submit.</p>
        {mediaItems.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No media to review.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mediaItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-2">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
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
                        controls
                        preload="metadata"
                      />
                    )}
                    {item.tagTimestamp && (
                      <Badge className="absolute top-1 left-1 text-xs">
                        {item.tagTimestamp}
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRestart}
          >
            Restart
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={mediaItems.length === 0}
            onClick={() => onConfirm(mediaItems)}
          >
            Submit {mediaItems.length > 0 ? `(${mediaItems.length})` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
} 