
'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Video, RotateCcw, Trash2, Play, Pause } from 'lucide-react'

interface VideoPreviewFallbackProps {
  url: string
}

function VideoPreviewFallback({ url }: VideoPreviewFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [url])

  // Always show fallback UI when there's an error
  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
        <div className="relative">
          <Video className="h-8 w-8 text-gray-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-400 rotate-45" />
          </div>
        </div>
        <p className="text-xs text-center px-2 mt-2">
          Playback not available on this device
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {!hasError && (
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          playsInline
          muted
        />
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
import { toast } from '@/hooks/use-toast'
import { MediaReviewScreen } from './media-review-screen'
import { supabase } from '@/lib/supabase'


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
  onBack?: () => void
  uuid: string
  user: string
}

export function MediaCaptureScreen({ onNext, onBack, uuid, user }: MediaCaptureScreenProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [iframeWarning, setIframeWarning] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const hasStartedCamera = useRef(false)
  const [showReview, setShowReview] = useState(false)


  // Check for iframe and allow="camera"
  /*
 useEffect(() => {
    if (window.self !== window.top) {
      // Running inside an iframe, but can't verify permissions due to cross-origin
      setIframeWarning('⚠️ App is running in an iframe. Ensure the embed includes allow="camera".');
      console.warn('Running in iframe. Cannot verify iframe attributes due to cross-origin.');
    }
  }, []);
*/

  const startCamera = useCallback(async () => {
    if (hasStartedCamera.current) {
      console.log('Camera already started, skipping getUserMedia.');
      return;
    }
    setCameraError(null);
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: true });
      hasStartedCamera.current = true;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStream(stream);
      console.log('Camera access granted, stream started.');
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied or unavailable. Please check your browser permissions.');
      toast({
        title: "Camera Error",
        description: error?.message || "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [facingMode]);

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
      setShowReview(true)
    }
  }

  const handleEnableCamera = () => {
    setCameraActive(true);
    startCamera();
  };

  // Add a function to fully reset state and re-initialize camera
  const handleRestart = () => {
    setMediaItems([])
    setShowReview(false)
    setIsRecording(false)
    setCameraActive(false)
    setCameraError(null)
    setIframeWarning(null)
    hasStartedCamera.current = false
    // Camera will re-initialize when user clicks Start Camera again
  }

  // Only restart camera if explicitly restarted (not on every facingMode change)
  // Remove previous useEffect for facingMode

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        console.log('Camera stream stopped on unmount.');
      }
    };
  }, [cameraStream]);

  if (showReview) {
    return (
      <MediaReviewScreen
        mediaItems={mediaItems}
        onRestart={handleRestart}
        onConfirm={(finalMedia) => onNext(finalMedia)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="space-y-4">
        {iframeWarning && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-center text-sm">{iframeWarning}</div>
        )}
        {cameraError && (
          <div className="bg-red-100 text-red-800 p-2 rounded text-center text-sm">{cameraError}</div>
        )}
        {!cameraActive ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Button onClick={handleEnableCamera} className="min-h-[56px] min-w-[180px] text-lg">Start Camera</Button>
            <p className="mt-4 text-gray-500 text-center">Tap to enable your camera and microphone</p>
          </div>
        ) : (
          <>
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
                            <VideoPreviewFallback url={item.url} />
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
                : 'Review Media'
              }
            </Button>
          </>
        )}
      </div>
    </div>
  )
}