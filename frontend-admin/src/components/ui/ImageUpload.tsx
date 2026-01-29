'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string, width: number, height: number) => void;
  onClear?: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onClear,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedFormats.join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Convert to base64 for client-side storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          onChange(dataUrl, img.width, img.height);
          setIsLoading(false);
        };
        img.onerror = () => {
          setError('Failed to load image');
          setIsLoading(false);
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setIsLoading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  if (value) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-auto max-h-96 object-contain"
          />
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-brand-teal bg-brand-light'
            : 'border-gray-300 bg-gray-50 hover:border-brand-teal hover:bg-gray-100',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        {isLoading ? (
          <>
            <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-brand-teal" />
            <p className="text-sm text-gray-600">Processing image...</p>
          </>
        ) : (
          <>
            {isDragging ? (
              <ImageIcon className="mb-3 h-12 w-12 text-brand-teal" />
            ) : (
              <Upload className="mb-3 h-12 w-12 text-gray-400" />
            )}
            <p className="mb-1 text-sm font-medium text-gray-700">
              {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.map((f) => f.split('/')[1]).join(', ').toUpperCase()} • Max {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
