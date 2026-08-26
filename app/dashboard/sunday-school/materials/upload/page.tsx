'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleInputChange = (field: keyof MaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (files.length === 0) newErrors.files = 'At least one file is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setUploading(true);
    try {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const materialData: MaterialFormData = {
        ...formData,
        tags: tagList,
        file: files[0]?.file
      };

      const response = await sundaySchoolService.uploadMaterial(materialData);
      if (response.success) {
        toast.success('Material uploaded successfully');
        router.push('/dashboard/sunday-school/materials');
      } else {
        toast.error(response.message || 'Failed to upload material');
      }
    } catch {
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/sunday-school/materials">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Upload Teaching Material</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload curriculum documents, lesson plans, activity worksheets, and media.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Material Details</h2>

            <div className="grid grid-cols-12 gap-5">
              {/* Title (6 cols) */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. David and Goliath - Faith & Courage"
                  required
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              {/* Resource Type (3 cols) */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="type">Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => handleInputChange('type', val as MaterialType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Age Group (3 cols) */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="ageGroup">Target Age Group</Label>
                <Select
                  value={formData.ageGroup}
                  onValueChange={(val) => handleInputChange('ageGroup', val as AgeGroup)}
                >
                  <SelectTrigger id="ageGroup">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description (12 cols) */}
              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Overview of lesson, learning objectives, scripture references..."
                  rows={3}
                  required
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              {/* Tags (12 cols) */}
              <div className="col-span-12 space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Faith, Courage, Old Testament, Activity"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Attach Files</h2>

            <FileUpload
              onUpload={handleFilesSelected}
              accept=".pdf,.docx,.doc,.mp4,.mov,.mp3,.wav,.jpg,.jpeg,.png"
              maxSize={50 * 1024 * 1024}
              maxFiles={5}
            />

            {errors.files && <p className="text-xs text-destructive">{errors.files}</p>}

            {files.length > 0 && (
              <div className="space-y-2 pt-1">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate">{file.file.name}</span>
                      <span className="text-muted-foreground">({(file.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/sunday-school/materials')}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-4 w-4" />
                Upload Material
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}