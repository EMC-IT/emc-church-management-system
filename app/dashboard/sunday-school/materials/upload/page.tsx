'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { MaterialType, AgeGroup, MaterialFormData } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const materialTypes = Object.values(MaterialType);
const ageGroups = Object.values(AgeGroup);

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function UploadMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MaterialFormData>({
    title: '',
    description: '',
    type: MaterialType.LESSON_PLAN,
    ageGroup: AgeGroup.PRIMARY,
    tags: [],
    isPublic: true
  });
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tags, setTags] = useState('');

  const handleBack = () => {
    router.push('/dashboard/sunday-school/materials');
  };

  const handleInputChange = (field: keyof MaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles: UploadFile[] = selectedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (files.length === 0) {
      newErrors.files = 'At least one file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate file upload with progress
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: Math.min(f.progress + 10, 90), status: 'uploading' }
            : f
        ));
      }, 200);

      // Simulate upload completion after 2 seconds
      setTimeout(() => {
        clearInterval(interval);
        
        // Simulate random success/failure (90% success rate)
        if (Math.random() > 0.1) {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress: 100, status: 'completed' }
              : f
          ));
          resolve(`https://example.com/files/${uploadFile.file.name}`);
        } else {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          ));
          reject(new Error('Upload failed'));
        }
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload files first
      const uploadPromises = files.map(file => uploadFile(file));
      const fileUrls = await Promise.all(uploadPromises);
      
      // Process tags
      const processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Create material with file URLs
      const materialData = {
        ...formData,
        tags: processedTags,
        fileUrls
      };
      
      const response = await sundaySchoolService.uploadMaterial(materialData);
      
      if (response.success) {
        toast.success('Material uploaded successfully');
        router.push('/dashboard/sunday-school/materials');
      } else {
        toast.error(response.message || 'Failed to upload material');
      }
    } catch (error) {
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const getFileStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-brand-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Upload Material</h1>
              <p className="text-muted-foreground">Add new teaching resources</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Material Information</CardTitle>
                <CardDescription>
                  Provide details about the teaching material
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter material title"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the material and its purpose"
                    rows={4}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Material Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleInputChange('type', value as MaterialType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group *</Label>
                    <Select 
                      value={formData.ageGroup} 
                      onValueChange={(value) => handleInputChange('ageGroup', value as AgeGroup)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas (e.g., bible, story, activity)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Tags help others find your material more easily
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload teaching materials, worksheets, images, or other resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  onUpload={handleFilesSelected}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
                  multiple
                  maxSize={50 * 1024 * 1024} // 50MB
                />
                
                {errors.files && (
                  <p className="text-sm text-destructive">{errors.files}</p>
                )}

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files</h4>
                    <div className="space-y-2">
                      {files.map((uploadFile) => (
                        <div key={uploadFile.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          {getFileStatusIcon(uploadFile.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(uploadFile.file.size)}
                            </p>
                            {uploadFile.status === 'uploading' && (
                              <Progress value={uploadFile.progress} className="mt-1 h-1" />
                            )}
                            {uploadFile.status === 'error' && uploadFile.error && (
                              <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                            )}
                          </div>
                          {uploadFile.status === 'pending' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(uploadFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Title:</span>
                    <span className="font-medium">{formData.title || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <span className="font-medium">{formData.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Age Group:</span>
                    <span className="font-medium">{formData.ageGroup}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Files:</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  {tags && (
                    <div className="space-y-1">
                      <span className="text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {tags.split(',').map((tag, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Material
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleBack}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}