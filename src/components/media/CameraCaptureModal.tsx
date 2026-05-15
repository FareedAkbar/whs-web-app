"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  IconCamera,
  IconPhotoUp,
  IconRefresh,
  IconVideoOff,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({
  open,
  onClose,
  onCapture,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
    setIsFrontCamera(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!open) return;
    setIsStarting(true);
    setCameraError(null);

    try {
      stopCamera();

      const getUserMedia =
        navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);

      if (!getUserMedia) {
        setCameraError(
          window.isSecureContext
            ? "This browser does not support live camera preview."
            : "Live camera preview needs HTTPS on mobile. Use the device camera button below, or open the app over HTTPS.",
        );
        return;
      }

      const stream = await getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      setIsFrontCamera(videoTrack?.getSettings().facingMode === "user");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsReady(true);
    } catch (error) {
      console.error("Camera failed:", error);
      setCameraError("Camera is not available or permission was denied.");
      toast.error("Camera is not available or permission was denied.");
    } finally {
      setIsStarting(false);
    }
  }, [open, stopCamera]);

  useEffect(() => {
    if (open) {
      void startCamera();
    }

    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    setCameraError(null);
    onClose();
  };

  const handleFallbackCapture = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) return;

    onCapture(file);
    handleClose();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      toast.error("Camera is still starting. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture image.");
      return;
    }

    if (isFrontCamera) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Unable to capture image.");
          return;
        }

        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        handleClose();
      },
      "image/jpeg",
      0.92,
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-white">
        <input
          ref={fallbackInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFallbackCapture}
          className="hidden"
        />
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
          <div>
            <h2 className="font-semibold">Capture image</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Take a photo and attach it to this report.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Close camera"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="relative min-h-[280px] flex-1 bg-gray-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full max-h-[62vh] min-h-[280px] w-full object-cover ${
              isFrontCamera ? "-scale-x-100" : ""
            }`}
          />
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <IconVideoOff size={42} />
              <p className="max-w-md px-4 text-center text-sm">
                {cameraError ??
                  (isStarting ? "Starting camera..." : "Camera preview loading")}
              </p>
              {cameraError && (
                <Button
                  title="Open device camera"
                  icon={<IconPhotoUp size={16} />}
                  onClick={() => fallbackInputRef.current?.click()}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t p-4 dark:border-gray-700 sm:flex-row sm:justify-end">
          <Button
            title="Restart"
            variant="secondary"
            icon={<IconRefresh size={16} />}
            onClick={() => void startCamera()}
            disabled={isStarting}
          />
          <Button
            title="Device camera"
            variant="secondary"
            icon={<IconPhotoUp size={16} />}
            onClick={() => fallbackInputRef.current?.click()}
            disabled={isStarting}
          />
          <Button
            title="Capture"
            icon={<IconCamera size={16} />}
            onClick={handleCapture}
            disabled={!isReady}
          />
        </div>
      </div>
    </div>
  );
}
