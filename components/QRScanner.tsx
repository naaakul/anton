"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Copy, RefreshCw } from "lucide-react"

export default function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number>(null)

  const startScanner = async () => {
    setError(null)
    setScannedData(null)
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Start scanning for QR codes
        scanQRCode()
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access the camera. Please ensure you've granted camera permissions.")
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Only process frames when video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.height = video.videoHeight
      canvas.width = video.videoWidth

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for QR processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Process with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      // If QR code found
      if (code) {
        setScannedData(code.data)
        stopScanner()
        return
      }
    }

    // Continue scanning
    animationRef.current = requestAnimationFrame(scanQRCode)
  }

  const copyToClipboard = async () => {
    if (scannedData) {
      try {
        await navigator.clipboard.writeText(scannedData)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  useEffect(() => {
    console.log("data bolte - " ,scannedData);
  }, [scannedData])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="w-full">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
          {scanning ? (
            <>
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 border-2 border-white/50 rounded-lg"></div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {error ? (
                <p className="text-center text-red-400 mb-4">{error}</p>
              ) : scannedData ? (
                <div className="w-full p-4 text-center">
                  <h3 className="font-medium mb-2">Scanned Result:</h3>
                  <div className="bg-white/10 p-3 rounded-md overflow-auto max-h-32 text-sm break-all">
                    {scannedData}
                  </div>
                </div>
              ) : (
                <Camera className="h-12 w-12 mb-2 opacity-50" />
              )}
              <Button onClick={startScanner} className="mt-4" variant={error || scannedData ? "default" : "outline"}>
                {error ? "Try Again" : scannedData ? "Scan Another Code" : "Start Camera"}
              </Button>
            </div>
          )}
        </div>

        {scannedData && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        )}
      <CardFooter className="text-sm text-muted-foreground">
        {scanning ? (
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning for QR code...
            </span>
            <Button variant="outline" size="sm" onClick={stopScanner}>
              Cancel
            </Button>
          </div>
        ) : (
          <p>Position a QR code in the camera view to scan it.</p>
        )}
      </CardFooter>
    </div>
  )
}

