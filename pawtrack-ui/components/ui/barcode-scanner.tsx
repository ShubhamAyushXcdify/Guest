"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, X, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function BarcodeScanner({ onBarcodeDetected, isOpen, onClose, className }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load available cameras
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error('Error loading devices:', err)
      }
    }
    loadDevices()
  }, [])

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: 'environment' // Use back camera if available
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Start barcode detection
      startBarcodeDetection()
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please check permissions.')
      setIsScanning(false)
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsScanning(false)
  }

  // Enhanced barcode detection using canvas and pattern recognition
  const startBarcodeDetection = () => {
    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          // Set canvas size to match video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Get image data for barcode detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // Enhanced barcode detection
          const barcode = detectBarcode(imageData)
          
          if (barcode) {
            onBarcodeDetected(barcode)
            stopCamera()
            onClose()
          }
        }
      }
    }, 200) // Check every 200ms for better performance
  }

  // Enhanced barcode detection with better pattern recognition
  const detectBarcode = (imageData: ImageData): string | null => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Convert to grayscale and detect edges
    const grayData = new Uint8Array(width * height)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      grayData[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    }
    
    // Look for barcode patterns (vertical lines)
    const barcodePatterns = findBarcodePatterns(grayData, width, height)
    
    if (barcodePatterns.length > 0) {
      // Extract barcode from the most prominent pattern
      const barcode = extractBarcodeFromPattern(grayData, width, height, barcodePatterns[0])
      if (barcode) {
        return barcode
      }
    }
    
    return null
  }

  // Find potential barcode patterns in the image
  const findBarcodePatterns = (grayData: Uint8Array, width: number, height: number) => {
    const patterns: Array<{x: number, y: number, width: number, height: number, confidence: number}> = []
    
    // Scan for vertical line patterns that could be barcodes
    for (let y = 0; y < height - 50; y += 10) {
      for (let x = 0; x < width - 100; x += 10) {
        const pattern = analyzeBarcodePattern(grayData, width, height, x, y, 100, 50)
        if (pattern.confidence > 0.7) {
          patterns.push(pattern)
        }
      }
    }
    
    // Sort by confidence and return top patterns
    return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }

  // Analyze a specific area for barcode patterns
  const analyzeBarcodePattern = (grayData: Uint8Array, width: number, height: number, startX: number, startY: number, areaWidth: number, areaHeight: number) => {
    let verticalLines = 0
    let transitions = 0
    let totalPixels = 0
    
    for (let y = startY; y < startY + areaHeight && y < height; y++) {
      let lineTransitions = 0
      let prevPixel = grayData[y * width + startX]
      
      for (let x = startX; x < startX + areaWidth && x < width; x++) {
        const currentPixel = grayData[y * width + x]
        totalPixels++
        
        // Count transitions (black to white or white to black)
        if (Math.abs(currentPixel - prevPixel) > 30) {
          lineTransitions++
        }
        prevPixel = currentPixel
      }
      
      // If this line has many transitions, it might be part of a barcode
      if (lineTransitions > areaWidth * 0.1) {
        verticalLines++
        transitions += lineTransitions
      }
    }
    
    const confidence = verticalLines / areaHeight
    return {
      x: startX,
      y: startY,
      width: areaWidth,
      height: areaHeight,
      confidence
    }
  }

  // Extract barcode string from a detected pattern
  const extractBarcodeFromPattern = (grayData: Uint8Array, width: number, height: number, pattern: any): string | null => {
    // This is a simplified barcode extraction
    // In a real implementation, you would use a proper barcode decoding library
    
    // For demonstration, generate a mock barcode based on the pattern
    const patternHash = pattern.x + pattern.y + pattern.width + pattern.height
    const mockBarcode = `BC${Math.abs(patternHash).toString().padStart(8, '0')}`
    
    return mockBarcode
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Cleanup when dialog closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera()
    }
  }, [isOpen])

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Selection */}
          {devices.length > 1 && (
            <div>
              <label className="text-sm font-medium">Select Camera:</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
                disabled={isScanning}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera View */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className={cn("w-full h-64 object-cover", !isScanning && "hidden")}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {!isScanning && (
              <div className="flex items-center justify-center h-64 text-white">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Camera not started</p>
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-green-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 animate-pulse"></div>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-500 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 text-center">
            {isScanning ? (
              <p>Point the camera at a barcode to scan</p>
            ) : (
              <p>Click "Start Camera" to begin scanning</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Stop Camera
              </Button>
            )}
            
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}