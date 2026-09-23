import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';
import { hapticMedium, hapticSuccess, hapticWarning } from '../utils/haptics';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

// This modal is mounted three times (meal log, pantry, chef). Caching the
// live MediaStream at module scope — instead of in component state — means
// every mount shares one already-granted camera, and closing/reopening the
// modal (or switching between those three screens) reuses it instead of
// calling getUserMedia() again. Browsers only need to ask for camera
// permission on that first call per session; repeating the call on every
// open was the reason permission looked like it was being re-requested
// each time.
let cachedStream: MediaStream | null = null;
let cachedFacingMode: 'environment' | 'user' | null = null;

function streamIsLive(s: MediaStream | null): s is MediaStream {
  return !!s && s.getVideoTracks().some((t) => t.readyState === 'live');
}

function releaseCachedStream() {
  cachedStream?.getTracks().forEach((track) => track.stop());
  cachedStream = null;
  cachedFacingMode = null;
}

if (typeof document !== 'undefined') {
  // Still release the hardware once the app is actually backgrounded or
  // closed, rather than keeping it "hot" indefinitely.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') releaseCachedStream();
  });
  window.addEventListener('pagehide', releaseCachedStream);
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileFallbackRef = useRef<HTMLInputElement>(null);

  // Detaches the preview without releasing the underlying hardware/permission.
  const pauseTracks = useCallback(() => {
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Check available camera devices
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start camera stream — reuses the cached stream when it's still live and
  // facing the same direction, only calling getUserMedia() when there's no
  // usable stream to reuse (first-ever open, or after flipping cameras).
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setCameraError(null);

    if (streamIsLive(cachedStream) && cachedFacingMode === mode) {
      if (videoRef.current) videoRef.current.srcObject = cachedStream;
      return;
    }

    releaseCachedStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. You can take or pick a photo using file upload.');
      return;
    }

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video request if ideal constraints fail
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      cachedStream = mediaStream;
      cachedFacingMode = mode;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      const error = err as { name?: string; message?: string };
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        setCameraError('No camera device detected on this device.');
      } else {
        setCameraError('Unable to start live camera preview.');
      }
    }
  }, []);

  // Handle open/close lifecycle. Closing only detaches the preview — it
  // deliberately does NOT stop the cached stream, so reopening (this modal
  // or one of its other two mounts) doesn't re-request the camera.
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      pauseTracks();
      setCapturedImage(null);
      setCameraError(null);
    }
  }, [isOpen, facingMode, startCamera, pauseTracks]);

  // Capture current frame from video stream onto canvas
  const handleSnap = () => {
    if (!videoRef.current) return;
    hapticMedium();

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Scale down if larger than 1200px to optimize storage
    const maxDim = 1200;
    let targetWidth = videoWidth;
    let targetHeight = videoHeight;

    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user front camera, mirror image for natural reflection
    if (facingMode === 'user') {
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Detach the preview (camera stays warm in the cache for a fast retake
    // or the next photo — see the module-level stream cache above).
    pauseTracks();
  };

  // Flip between front and back cameras — changing facingMode re-runs the
  // open/close effect above, which calls startCamera(nextMode) for us.
  const toggleCamera = () => {
    hapticMedium();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Confirm captured photo
  const handleConfirmPhoto = () => {
    if (!capturedImage) return;
    hapticSuccess();
    onCapture(capturedImage);
    onClose();
  };

  // Retake photo
  const handleRetake = () => {
    hapticMedium();
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Fallback file input change
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setCameraError(null);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden">
        {/* Shutter flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Top Header Bar */}
        <div className="relative z-30 px-4 pt-12 pb-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">
              Ingredient Camera
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticWarning();
              onClose();
            }}
            className="w-9 h-9 rounded-full liquid-glass-subtle flex items-center justify-center text-white/90 hover:text-white border border-white/20 active:scale-95 transition-all"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
          {capturedImage ? (
            /* Review captured photo */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured ingredient"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-4 px-3 py-1 rounded-full liquid-glass-subtle border border-white/30 text-xs font-semibold text-white/90 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Photo Captured
              </div>
            </div>
          ) : cameraError ? (
            /* Error / Permission fallback state */
            <div className="p-6 text-center max-w-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl liquid-glass-subtle mx-auto flex items-center justify-center text-amber-400 border border-white/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Camera Notice</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {cameraError}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl liquid-droplet-dark text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/30 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Take / Choose Photo from Device
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-all"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => {});
                }}
              />

              {/* Viewfinder Framing Guidelines */}
              <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-white/70 rounded-tr" />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-medium text-white/60 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                    Center ingredient in frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-white/70 rounded-bl" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br" />
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden file input for fallback */}
          <input
            ref={fileFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFallbackFileChange}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-30 px-6 pt-3 pb-8 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-between">
          {capturedImage ? (
            /* Review state controls: Retake or Confirm */
            <div className="w-full flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-2xl liquid-glass-subtle border border-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-2xl bg-white text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl hover:bg-neutral-100 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                Use Photo
              </button>
            </div>
          ) : (
            /* Live camera controls: Flip, Shutter, and Upload */
            <div className="w-full flex items-center justify-between">
              {/* Fallback Upload Button */}
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-11 h-11 rounded-full liquid-glass-subtle border border-white/20 flex flex-col items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
                title="Upload from gallery"
              >
                <span className="text-[10px] font-bold">Files</span>
              </button>

              {/* Shutter Button (iOS Camera Style) */}
              <button
                type="button"
                onClick={handleSnap}
                disabled={Boolean(cameraError)}
                className="relative w-18 h-18 rounded-full p-1 border-2 border-white/80 flex items-center justify-center group active:scale-90 transition-transform disabled:opacity-40 disabled:pointer-events-none"
                title="Take photo"
              >
                <div className="w-15 h-15 rounded-full bg-white shadow-lg group-hover:scale-95 transition-transform" />
              </button>

              {/* Flip Camera Button */}
              <button
                type="button"
                onClick={toggleCamera}
                disabled={!hasMultipleCameras}
                className={`w-11 h-11 rounded-full liquid-glass-subtle border border-white/20 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all ${
                  !hasMultipleCameras ? 'opacity-30 pointer-events-none' : ''
                }`}
                title="Flip camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
