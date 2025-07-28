import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, X, Link as LinkIcon, Image } from 'lucide-react';

interface ImageUploadProps {
  value: File | string | null;
  onChange: (file: File | string | null) => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "Product Image" }) => {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    onChange(file);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleUrlChange = (url: string) => {
    // Validate URL format
    try {
      new URL(url);
      onChange(url);
    } catch {
      // Invalid URL, don't update
      console.warn('Invalid URL format');
    }
  };

  const clearImage = () => {
    onChange(null);
  };

  const getImageUrl = () => {
    if (typeof value === 'string') {
      return value;
    }
    if (value instanceof File) {
      return URL.createObjectURL(value);
    }
    return null;
  };

  const getImageName = () => {
    if (typeof value === 'string') {
      return 'Image URL';
    }
    if (value instanceof File) {
      return value.name;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {/* Upload Method Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('url')}
        >
          <LinkIcon size={16} className="mr-1" />
          URL
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('file')}
        >
          <Upload size={16} className="mr-1" />
          Upload
        </Button>
      </div>

      {uploadMethod === 'url' ? (
        <div className="space-y-2">
          <Input
            type="url"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500">
            Tip: Use Unsplash URLs for high-quality product images
          </p>
        </div>
      ) : (
        <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors">
          <div
            {...getRootProps()}
            className={`p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-blue-50' : 'hover:bg-gray-50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
              className="space-y-4"
            >
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isUploading ? 'Uploading...' : isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                </p>
                <p className="text-sm text-gray-500">
                  {isUploading ? 'Please wait...' : 'or click to select a file'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports: JPG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
            </motion.div>
          </div>
        </Card>
      )}

      {/* Image Preview */}
      {value && (
        <Card className="relative overflow-hidden">
          <div className="relative">
            <img
              src={getImageUrl() || ''}
              alt="Product preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={clearImage}
              className="absolute top-2 right-2"
            >
              <X size={16} />
            </Button>
          </div>
          <div className="p-3 bg-gray-50">
            <p className="text-sm text-gray-600 truncate">{getImageName()}</p>
          </div>
        </Card>
      )}
    </div>
  );
};