import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

export default function PhotoCapture({ onPhotoCapture, photo, onRemove }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  React.useEffect(() => {
    // Set up callback for native camera capture
    window.onCameraCaptureComplete = async (imageData) => {
      setUploading(true);
      try {
        // Convert base64 to blob if needed, or use the provided URL directly
        let fileUrl;
        
        if (imageData.startsWith('data:') || imageData.startsWith('blob:')) {
          // If native wrapper returns base64 or blob URL, convert to file and upload
          const response = await fetch(imageData);
          const blob = await response.blob();
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          fileUrl = file_url;
        } else {
          // If native wrapper already uploaded and returns URL
          fileUrl = imageData;
        }
        
        onPhotoCapture(fileUrl);
      } catch (error) {
        console.error('Camera capture upload failed:', error);
        alert('Failed to save photo. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    window.onCameraCaptureFailed = (error) => {
      console.error('Camera capture failed:', error);
      setUploading(false);
      alert('Failed to capture photo. Please try again.');
    };

    return () => {
      delete window.onCameraCaptureComplete;
      delete window.onCameraCaptureFailed;
    };
  }, [onPhotoCapture]);

  const handleCameraCapture = () => {
    setUploading(true);
    
    // Check if running in iOS wrapper
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openCamera) {
      window.webkit.messageHandlers.openCamera.postMessage({});
    }
    // Check if running in Android wrapper
    else if (window.Android && window.Android.openCamera) {
      window.Android.openCamera();
    }
    // Fallback for web - use file input with camera capture
    else {
      setUploading(false);
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onPhotoCapture(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {photo ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-3xl overflow-hidden aspect-[4/3]"
          >
            <img 
              src={photo} 
              alt="Captured moment"
              className="w-full h-full object-cover"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
            
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        ) : (
          <button
            onClick={handleCameraCapture}
            disabled={uploading}
            className="w-full py-2 px-4 rounded-xl border theme-text-secondary text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-70"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'transparent'
            }}
          >
            {uploading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"
                />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Take photo</span>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}