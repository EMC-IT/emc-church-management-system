import apiClient from './api-client';

export interface UploadResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface UploadConfig {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  chunkSize?: number; // for large file uploads
  retryAttempts?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class UploadService {
  private defaultConfig: UploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 10,
    chunkSize: 1024 * 1024, // 1MB chunks
    retryAttempts: 3,
  };

  // ===== FILE VALIDATION =====

  // Validate file before upload
  validateFile(file: File, config: UploadConfig = {}): FileValidationResult {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > mergedConfig.maxFileSize!) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(mergedConfig.maxFileSize!)}`);
    }

    // Check file type
    if (mergedConfig.allowedTypes && mergedConfig.allowedTypes.length > 0) {
      const isAllowed = mergedConfig.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAllowed) {
        errors.push(`File type ${file.type} is not allowed. Allowed types: ${mergedConfig.allowedTypes.join(', ')}`);
      }
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (suspiciousExtensions.includes(fileExtension)) {
      warnings.push('This file type may be potentially harmful');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===== SINGLE FILE UPLOAD =====

  // Upload single file
  async uploadFile(
    file: File,
    category: string = 'general',
    onProgress?: (progress: UploadProgress) => void,
    config: UploadConfig = {}
  ): Promise<UploadResponse<UploadedFile>> {
    try {
      // Validate file first
      const validation = this.validateFile(file, config);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await apiClient.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            });
          }
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'File uploaded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file',
      };
    }
  }

  // ===== MULTIPLE FILES UPLOAD =====

  // Upload multiple files
  async uploadFiles(
    files: File[],
    category: string = 'general',
    onProgress?: (progress: UploadProgress) => void,
    config: UploadConfig = {}
  ): Promise<UploadResponse<UploadedFile[]>> {
    try {
      const mergedConfig = { ...this.defaultConfig, ...config };

      // Validate files
      const validationResults = files.map(file => this.validateFile(file, mergedConfig));
      const allValid = validationResults.every(result => result.isValid);

      if (!allValid) {
        const allErrors = validationResults.flatMap(result => result.errors);
        return {
          success: false,
          errors: allErrors,
        };
      }

      // Check max files limit
      if (files.length > mergedConfig.maxFiles!) {
        return {
          success: false,
          message: `Maximum ${mergedConfig.maxFiles} files allowed`,
        };
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('category', category);

      const response = await apiClient.post('/upload/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            });
          }
        },
      });

      return {
        success: true,
        data: response.data,
        message: `${files.length} files uploaded successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload files',
      };
    }
  }

  // ===== CHUNKED UPLOAD FOR LARGE FILES =====

  // Upload large file in chunks
  async uploadLargeFile(
    file: File,
    category: string = 'general',
    onProgress?: (progress: UploadProgress) => void,
    config: UploadConfig = {}
  ): Promise<UploadResponse<UploadedFile>> {
    try {
      const mergedConfig = { ...this.defaultConfig, ...config };

      // Validate file
      const validation = this.validateFile(file, mergedConfig);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
        };
      }

      // Initialize upload
      const initResponse = await apiClient.post('/upload/init', {
        fileName: file.name,
        fileSize: file.size,
        category,
      });

      const uploadId = initResponse.data.uploadId;
      const chunkSize = mergedConfig.chunkSize!;
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());

        await apiClient.post('/upload/chunk', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedChunks++;
        if (onProgress) {
          onProgress({
            loaded: uploadedChunks,
            total: totalChunks,
            percentage: Math.round((uploadedChunks * 100) / totalChunks),
          });
        }
      }

      // Complete upload
      const completeResponse = await apiClient.post('/upload/complete', {
        uploadId,
      });

      return {
        success: true,
        data: completeResponse.data,
        message: 'Large file uploaded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload large file',
      };
    }
  }

  // ===== FILE MANAGEMENT =====

  // Get uploaded files
  async getUploadedFiles(category?: string, page: number = 1, limit: number = 20): Promise<UploadResponse<{
    data: UploadedFile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const params: any = { page, limit };
      if (category) params.category = category;

      const response = await apiClient.get('/upload/files', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch uploaded files',
      };
    }
  }

  // Get uploaded file by ID
  async getUploadedFile(id: string): Promise<UploadResponse<UploadedFile>> {
    try {
      const response = await apiClient.get(`/upload/files/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch uploaded file',
      };
    }
  }

  // Delete uploaded file
  async deleteUploadedFile(id: string): Promise<UploadResponse<void>> {
    try {
      await apiClient.delete(`/upload/files/${id}`);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete file',
      };
    }
  }

  // Bulk delete uploaded files
  async bulkDeleteUploadedFiles(ids: string[]): Promise<UploadResponse<void>> {
    try {
      await apiClient.post('/upload/files/bulk-delete', { ids });
      return {
        success: true,
        message: 'Files deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete files',
      };
    }
  }

  // ===== IMAGE PROCESSING =====

  // Generate thumbnail for image
  async generateThumbnail(fileId: string, width: number = 200, height: number = 200): Promise<UploadResponse<{ thumbnailUrl: string }>> {
    try {
      const response = await apiClient.post(`/upload/files/${fileId}/thumbnail`, {
        width,
        height,
      });
      return {
        success: true,
        data: response.data,
        message: 'Thumbnail generated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate thumbnail',
      };
    }
  }

  // Resize image
  async resizeImage(fileId: string, width: number, height: number): Promise<UploadResponse<{ resizedUrl: string }>> {
    try {
      const response = await apiClient.post(`/upload/files/${fileId}/resize`, {
        width,
        height,
      });
      return {
        success: true,
        data: response.data,
        message: 'Image resized successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resize image',
      };
    }
  }

  // ===== UTILITY METHODS =====

  // Format file size for display
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Check if file is an image
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Check if file is a document
  isDocumentFile(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    return documentTypes.includes(file.type);
  }

  // Get upload statistics
  async getUploadStats(): Promise<UploadResponse<{
    totalFiles: number;
    totalSize: number;
    filesByCategory: Array<{
      category: string;
      count: number;
      size: number;
    }>;
    recentUploads: UploadedFile[];
  }>> {
    try {
      const response = await apiClient.get('/upload/stats');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch upload statistics',
      };
    }
  }
}

export default new UploadService(); 