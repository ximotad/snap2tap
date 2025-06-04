
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { WizardLayout } from '@/components/ui/wizard-layout'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Video, RotateCcw, Trash2, Play, Pause } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface MediaItem {
  id: string
  type: 'photo' | 'video'
  url: string
  uploading: boolean
  uploaded: boolean
  tagTimestamp?: string
}

interface MediaCaptureScreenProps {
  onNext: (mediaItems: MediaItem[]) => void
  onBack: () => void
}

export function MediaCaptureScreen({ onNext, onBack }: MediaCaptureScreenProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraStream(stream)
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      })
    }
  }, [facingMode])

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    if (context) {
      context.drawImage(videoRef.current, 0, 0)
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8)
      
      const newPhoto: MediaItem = {
        id: Date.now().toString(),
        type: 'photo',
        url: photoUrl,
        uploading: true,
        uploaded: false,
        tagTimestamp: isRecording ? `${Math.floor(Date.now() / 1000)}s` : undefined
      }
      
      setMediaItems(prev => [...prev, newPhoto])
      
      // Simulate upload
      setTimeout(() => {
        setMediaItems(prev => 
          prev.map(item => 
            item.id === newPhoto.id 
              ? { ...item, uploading: false, uploaded: true }
              : item
          )
        )
      }, 2000)
      
      toast({
        title: isRecording ? "Photo Tagged!" : "Photo Captured!",
        description: isRecording ? "Photo saved with timestamp" : "Photo added to inspection",
      })
    }
  }

  const toggleRecording = () => {
    if (!cameraStream) return

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      // Start recording
      const mediaRecorder = new MediaRecorder(cameraStream)
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const videoUrl = URL.createObjectURL(blob)
        
        const newVideo: MediaItem = {
          id: Date.now().toString(),
          type: 'video',
          url: videoUrl,
          uploading: true,
          uploaded: false
        }
        
        setMediaItems(prev => [...prev, newVideo])
        
        // Simulate upload
        setTimeout(() => {
          setMediaItems(prev => 
            prev.map(item => 
              item.id === newVideo.id 
                ? { ...item, uploading: false, uploaded: true }
                : item
            )
          )
        }, 3000)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    }
  }

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const deleteMedia = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }

  const allUploadsComplete = mediaItems.length > 0 && mediaItems.every(item => item.uploaded)

  const handleNext = () => {
    if (allUploadsComplete) {
      onNext(mediaItems)
    }
  }

  // Initialize camera on mount
  React.useEffect(() => {
    startCamera()
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [startCamera])

  // Restart camera when facing mode changes
  React.useEffect(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      startCamera()
    }
  }, [facingMode, startCamera])

  return (
    <WizardLayout
      currentStep={3}
      totalSteps={5}
      stepTitle="Capture Media"
      onBack={onBack}
    >
      <div className="space-y-4">
        {/* Camera View */}
        <Card>
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onClick={capturePhoto}
              />
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">REC</span>
                </div>
              )}
              
              {/* Tap to capture hint */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm text-center bg-black/50 px-3 py-2 rounded">
                  {isRecording ? 'Tap to capture photo during recording' : 'Tap anywhere to capture photo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={flipCamera}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={capturePhoto}
            className="min-h-[56px] min-w-[56px] p-3 bg-white border-4 border-gray-300 rounded-full hover:bg-gray-50"
          >
            <Camera className="h-6 w-6 text-gray-900" />
          </Button>
          
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "outline"}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <Video className="h-5 w-5" />
          </Button>
        </div>

        {/* Media Thumbnails */}
        {mediaItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Captured Media ({mediaItems.length})
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
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
                          controls={false}
                        />
                      )}
                      
                      {/* Upload Status */}
                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      
                      {/* Tag Timestamp */}
                      {item.tagTimestamp && (
                        <Badge className="absolute top-1 left-1 text-xs">
                          {item.tagTimestamp}
                        </Badge>
                      )}
                      
                      {/* Delete Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMedia(item.id)}
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!allUploadsComplete}
          className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
        >
          {mediaItems.length === 0
            ? 'Capture at least one photo or video'
            : !allUploadsComplete
            ? 'Waiting for uploads to complete...'
            : 'Continue to Checklist'
          }
        </Button>
      </div>
    </WizardLayout>
  )
}
