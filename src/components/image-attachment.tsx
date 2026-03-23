'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageAttachment } from '@/lib/prd';

interface ImageAttachmentComponentProps {
  images: ImageAttachment[];
  onImagesChange: (images: ImageAttachment[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
}

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export default function ImageAttachmentComponent({
  images,
  onImagesChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES
}: ImageAttachmentComponentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported. Accepted types: JPEG, PNG, GIF, WebP`;
      }

      if (file.size > maxFileSize) {
        return `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
      }

      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  const processFile = useCallback(
    async (file: File): Promise<ImageAttachment | null> => {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => [...prev, error]);
        return null;
      }

      try {
        const preview = await createImagePreview(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        };
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `Failed to process ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`
        ]);
        return null;
      }
    },
    [validateFile]
  );

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      setErrors([]);

      if (images.length + files.length > maxImages) {
        setErrors((prev) => [
          ...prev,
          `Cannot add more than ${maxImages} images`
        ]);
        return;
      }

      const newImages: ImageAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const imageAttachment = await processFile(files[i]);
        if (imageAttachment) {
          newImages.push(imageAttachment);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onImagesChange, processFile]
  );

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <div
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? 'border-[#6366f1] bg-[#6366f1]/5'
              : 'border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-[#f9fafb]'
          } `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="space-y-2">
            <Upload className="mx-auto h-10 w-10 text-[#9ca3af]" />
            <div>
              <p className="text-sm font-medium text-[#374151]">
                {dragActive
                  ? 'Drop images here'
                  : 'Attach images to your product idea'}
              </p>
              <p className="text-xs text-[#9ca3af]">
                Drag and drop or click to select
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Max {maxImages} images • Max{' '}
                {(maxFileSize / 1024 / 1024).toFixed(1)}MB each
              </p>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-xs text-[#dc2626]"
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-[#374151]">
              <ImageIcon className="h-4 w-4 text-[#6b7280]" />
              <span>
                Attached Images ({images.length}/{maxImages})
              </span>
            </h3>
            {images.length < maxImages && (
              <button
                type="button"
                onClick={openFileDialog}
                className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5]"
              >
                Add More
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:bg-[#fef2f2] hover:text-[#dc2626]"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="border-t border-[#e5e7eb] px-3 py-2">
                  <p className="truncate text-xs font-medium text-[#374151]">
                    {image.name}
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {formatFileSize(image.size)} •{' '}
                    {image.type.split('/')[1].toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
