"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Download,
} from "lucide-react";

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  onRemove?: (file: File) => void;
  onPreview?: (file: File) => void;
  onDownload?: (file: File) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'drag-drop' | 'button';
  placeholder?: string;
  helpText?: string;
  showProgress?: boolean;
  showPreview?: boolean;
  showFileList?: boolean;
  uploadProgress?: Record<string, number>;
  uploadedFiles?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  }>;
}

export function FileUpload({
  onUpload,
  onRemove,
  onPreview,
  onDownload,
  multiple = false,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  disabled = false,
  loading = false,
  className,
  variant = 'default',
  placeholder = "Choose files or drag and drop",
  helpText,
  showProgress = true,
  showPreview = true,
  showFileList = true,
  uploadProgress = {},
  uploadedFiles = [],
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not allowed. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (multiple && selectedFiles.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
      setSelectedFiles(newFiles);
      onUpload(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (file: File) => {
    setSelectedFiles(selectedFiles.filter(f => f !== file));
    onRemove?.(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      default:
        return null;
    }
  };

  const renderDragDrop = () => (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">{placeholder}</p>
      {helpText && <p className="text-sm text-muted-foreground mb-4">{helpText}</p>}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
      >
        Choose Files
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Max size: {formatFileSize(maxSize)} • {multiple ? `Max files: ${maxFiles}` : 'Single file'}
      </p>
    </div>
  );

  const renderButton = () => (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {placeholder}
      </Button>
      {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {variant === 'drag-drop' && renderDragDrop()}
      {variant === 'button' && renderButton()}
      {variant === 'default' && (
        <div className="space-y-4">
          {renderDragDrop()}
          {renderButton()}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {showFileList && selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {onPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {showFileList && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon({ name: file.name, type: file.type } as File)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        {file.error && (
                          <p className="text-xs text-red-500">{file.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getFileStatusIcon(file.status)}
                      {file.status === 'success' && onDownload && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownload({ name: file.name, type: file.type } as File)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {file.status === 'success' && onPreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreview({ name: file.name, type: file.type } as File)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove({ name: file.name, type: file.type } as File)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {showProgress && file.status === 'uploading' && uploadProgress[file.id] !== undefined && (
                    <div className="mt-2">
                      <Progress value={uploadProgress[file.id]} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadProgress[file.id]}% uploaded
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Image Upload Component
export interface ImageUploadProps extends Omit<FileUploadProps, 'accept' | 'onUpload'> {
  onUpload: (files: File[]) => void;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  showPreview?: boolean;
}

export function ImageUpload({
  onUpload,
  maxWidth = 1920,
  maxHeight = 1080,
  aspectRatio,
  showPreview = true,
  ...props
}: ImageUploadProps) {
  const imageAccept = "image/*";
  
  return (
    <FileUpload
      {...props}
      accept={imageAccept}
      onUpload={onUpload}
      showPreview={showPreview}
      placeholder="Choose images or drag and drop"
      helpText={`Supported formats: JPG, PNG, GIF. Max size: ${props.maxSize ? `${props.maxSize / (1024 * 1024)}MB` : '10MB'}`}
    />
  );
}

// Document Upload Component
export interface DocumentUploadProps extends Omit<FileUploadProps, 'accept' | 'onUpload'> {
  onUpload: (files: File[]) => void;
  allowedTypes?: string[];
}

export function DocumentUpload({
  onUpload,
  allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ...props
}: DocumentUploadProps) {
  const documentAccept = allowedTypes.join(',');
  
  return (
    <FileUpload
      {...props}
      accept={documentAccept}
      onUpload={onUpload}
      placeholder="Choose documents or drag and drop"
      helpText="Supported formats: PDF, DOC, DOCX"
    />
  );
} 