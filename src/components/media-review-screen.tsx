import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }

  const convertDataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const response = await fetch(dataUrl)
    return response.blob()
  }

  const uploadToSupabase = async (mediaItem: MediaItem): Promise<string> => {
    try {
      // Convert data URL to blob
      const blob = await convertDataUrlToBlob(mediaItem.url)
      
      // Generate unique filename
      const fileExtension = mediaItem.type === 'photo' ? 'jpg' : 'mp4'
      const fileName = `${mediaItem.id}.${fileExtension}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: mediaItem.type === 'photo' ? 'image/jpeg' : 'video/mp4',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading to Supabase:', error)
      throw error
    }
  }

  const notifyGlide = async (inspectionId: string, mediaUrls: string[]): Promise<void> => {
    const response = await fetch('/api/notify-glide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspection_id: inspectionId,
        media: mediaUrls,
        status: 'complete',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Webhook failed: ${errorText}`)
    }
  }

  const handleSubmit = async () => {
    if (mediaItems.length === 0) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Get UUID from URL
      const urlParams = new URLSearchParams(window.location.search)
      const uuid = urlParams.get('uuid')
      
      if (!uuid) {
        throw new Error('No UUID found in URL')
      }

      // Upload all media items to Supabase
      const uploadPromises = mediaItems.map(async (item) => {
        return await uploadToSupabase(item)
      })

      const mediaUrls = await Promise.all(uploadPromises)

      // Send to notify-glide API
      await notifyGlide(uuid, mediaUrls)

      setSubmitStatus('success')
    } catch (error: any) {
      console.error('Submission error:', error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Done!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your media has been successfully uploaded and submitted.
          </p>
          <Button
            variant="outline"
            onClick={onRestart}
            className="mt-4"
          >
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  if (submitStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submission Failed</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            {errorMessage}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={onRestart}
            >
              Start Over
            </Button>
            <Button
              onClick={() => {
                setSubmitStatus('idle')
                setErrorMessage('')
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
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
                      disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            Restart
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={mediaItems.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Submit ${mediaItems.length > 0 ? `(${mediaItems.length})` : ''}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 