"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";
import Image from "next/image";
import { Download } from "lucide-react";

export default function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const [ping, setPing] = useState(true);
  const [accumulatedData, setAccumulatedData] = useState("");
  const [files, setFiles] = useState<
    { name: string; content: string; url: string }[]
  >([]);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [processingChunk, setProcessingChunk] = useState(false);

  const startScanner = async () => {
    setError(null);
    setScannedData(null);
    setLastScannedCode(null);
    setProcessingChunk(false);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        scanQRCode();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access the camera. Please ensure you've granted camera permissions."
      );
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || processingChunk) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data && code.data !== lastScannedCode) {
        // Mark that we're processing to prevent multiple rapid scans
        setProcessingChunk(true);
        
        // Store this code to prevent re-scanning the same code
        setLastScannedCode(code.data);
        
        // Store the newly scanned data
        setScannedData(code.data);
        
        // Increment chunk counter
        setChunkCount(prev => prev + 1);
        
        // Toggle ping to signal to sender we've received this chunk
        setPing(prev => !prev);
        
        // Update accumulated data
        setAccumulatedData(prevData => {
          const newData = prevData + code.data;
          
          // Check if the accumulated data contains the termination pattern
          if (code.data.endsWith("*^*~TER~*^*") || newData.includes("*^*~TER~*^*")) {
            // Process the complete data after this render cycle
            setTimeout(() => {
              processText(newData);
              stopScanner();
            }, 0);
          } else {
            // If not the terminal chunk, allow scanning to continue after a delay
            // This delay gives time for the sender to see our ping change and update their QR
            setTimeout(() => {
              setProcessingChunk(false);
            }, 1000); // 1 second delay to ensure sender has time to see the ping change
          }
          
          return newData;
        });
        
        return;
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode);
  };

  const processText = (dataToProcess: string) => {
    const filePattern = /\*\^\*~(.*?)~\*\^\*([\s\S]*?)\*\^\*~TER~\*\^\*/g;
    const extractedFiles: { name: string; content: string; url: string }[] = [];
    let match;

    while ((match = filePattern.exec(dataToProcess)) !== null) {
      const fileName = match[1];
      const fileContent = match[2];

      // Create blob and URL
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      extractedFiles.push({
        name: fileName,
        content: fileContent,
        url: url,
      });
    }

    setFiles(extractedFiles);
  };

  const resetScanner = () => {
    setAccumulatedData("");
    setScannedData(null);
    setFiles([]);
    setError(null);
    setChunkCount(0);
    setLastScannedCode(null);
    setProcessingChunk(false);
  };

  useEffect(() => {
    // Continue scanning if not processing a chunk
    if (scanning && !processingChunk && animationRef.current === null) {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  }, [scanning, processingChunk]);

  useEffect(() => {
    return () => {
      // Clean up resources
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Release any blob URLs to prevent memory leaks
      files.forEach(file => {
        URL.revokeObjectURL(file.url);
      });
    };
  }, [files]);

  return (
    <div className="w-full">
      <div className="w-full flex justify-around">
        <div className="relative aspect-video w-[20vw] h-[20vw] overflow-hidden rounded-lg bg-zinc-900">
          {scanning ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {error ? (
                <p className="text-center text-red-400 mb-4">{error}</p>
              ) : accumulatedData ? (
                <div className="w-full p-4 text-center">
                  <h3 className="font-medium mb-2">Scanned Data:</h3>
                  <div className="bg-white/10 p-3 rounded-md overflow-auto max-h-32 text-sm break-all">
                    {accumulatedData.length > 100 
                      ? `${accumulatedData.substring(0, 100)}...` 
                      : accumulatedData}
                  </div>
                  <p className="mt-2 text-sm text-green-400">
                    {chunkCount} chunks received
                  </p>
                </div>
              ) : (
                <Camera className="h-12 w-12 mb-2 opacity-50" />
              )}
              <Button
                onClick={files.length > 0 ? resetScanner : startScanner}
                className="mt-4 text-zinc-700 bg-zinc-200 hover:bg-white cursor-pointer hover:text-black"
                variant={error || accumulatedData ? "default" : "outline"}
              >
                {error
                  ? "Try Again"
                  : files.length > 0
                  ? "Reset Scanner"
                  : accumulatedData
                  ? "Scan Another Code"
                  : "Start Camera"}
              </Button>
            </div>
          )}
        </div>
        <div className="w-[20vw] overflow-hidden h-[20vw] bg-amber-500 rounded-lg flex items-center justify-center">
          {ping ? (
            <Image
              src={"/1.png"}
              alt="Ready for next chunk"
              width={1200}
              height={1200}
              className="w-full h-full"
            />
          ) : (
            <Image
              src={"/0.png"}
              alt="Processing chunk"
              width={1200}
              height={1200}
              className="w-full h-full"
            />
          )}
          {scanning && (
            <div className="absolute text-black font-bold text-lg">
              {chunkCount > 0 ? `Chunk ${chunkCount}` : "Ready to scan"}
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-[1px] bg-zinc-600 m-4"></div>

      <CardFooter className="text-sm text-muted-foreground">
        {scanning ? (
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center">
              {processingChunk ? (
                <span className="text-green-400">Processing chunk data...</span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scanning for QR code...
                </>
              )}
            </span>
            <Button variant="outline" size="sm" onClick={stopScanner}>
              Cancel
            </Button>
          </div>
        ) : (
          <p>Position a QR code in the camera view to scan it.</p>
        )}
      </CardFooter>
      <div className="space-y-2 mt-4">
        <p className="text-white font-medium">Extracted Files</p>
        {files.length > 0 ? (
          <>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex bg-white items-center justify-between p-2 rounded"
              >
                <span>{file.name}</span>
                <a
                  href={file.url}
                  download={file.name}
                  className="flex items-center text-primary hover:underline"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </div>
            ))}
          </>
        ) : (
          <p className="text-gray-400 text-sm italic">No files extracted yet</p>
        )}
      </div>
    </div>
  );
}