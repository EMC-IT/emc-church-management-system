'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { documentsService } from '@/services';
import { DocumentCategory, Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  X,
  Check,
  AlertCircle,
  Info,
  Calendar,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

// Form validation schema for document upload
const documentUploadSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(DocumentCategory),
  isPublic: z.boolean().default(false),
  tags: z.string().optional(),
});

type DocumentUploadData = z.infer<typeof documentUploadSchema>;

// Mock member data for development
const mockMember: Member = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '+233 24 123 4567',
  address: '123 Main Street, Accra, Ghana',
  dateOfBirth: '1988-05-15',
  gender: 'Male',
  membershipStatus: 'Active',
  joinDate: '2023-01-15',
  avatar: null,
  familyId: 'fam1',
  emergencyContact: {
    name: 'Jane Smith',
    phone: '+233 24 123 4568',
    relationship: 'Spouse'
  },
  customFields: {},
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z'
};

export default function DocumentUploadPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  const form = useForm<DocumentUploadData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: DocumentCategory.OTHER,
      isPublic: false,
      tags: '',
    },
  });

  // Load member data
  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await membersService.getMember(memberId);
        // setMember(response);
        setMember(mockMember);
      } catch (err: any) {
        setError(err.message || 'Failed to load member');
        toast({
          title: 'Error',
          description: 'Failed to load member details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadMember();
    }
  }, [memberId, toast]);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleUploadDocuments = async (data: DocumentUploadData) => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one file to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];

      // Upload each file
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('title', `${data.title}${uploadedFiles.length > 1 ? ` (${index + 1})` : ''}`);
        formData.append('description', data.description || '');
        formData.append('category', data.category);
        formData.append('isPublic', data.isPublic.toString());
        formData.append('tags', JSON.stringify(tags));
        formData.append('file', file);

        // Simulate upload progress
        const progressKey = file.name;
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));

        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[progressKey] || 0;
            if (current >= 90) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [progressKey]: current + 10 };
          });
        }, 200);

        try {
          const response = await documentsService.uploadDocument(memberId, formData);
          setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
          clearInterval(interval);
          return response;
        } catch (error) {
          clearInterval(interval);
          throw error;
        }
      });

      await Promise.all(uploadPromises);

      toast({
        title: 'Success',
        description: `${uploadedFiles.length} document(s) uploaded successfully`,
      });

      router.push(`/dashboard/members/${memberId}/documents`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to upload documents',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: DocumentCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Member not found'}
        </div>
        <Button asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/members/${member.id}/documents`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
            <p className="text-muted-foreground">
              Upload documents for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>
              Provide details about the documents you're uploading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUploadDocuments)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter document title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for the document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter document description (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Additional details about the document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DocumentCategory.IDENTIFICATION}>
                            {getCategoryLabel(DocumentCategory.IDENTIFICATION)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.BAPTISM}>
                            {getCategoryLabel(DocumentCategory.BAPTISM)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.CONFIRMATION}>
                            {getCategoryLabel(DocumentCategory.CONFIRMATION)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.MARRIAGE}>
                            {getCategoryLabel(DocumentCategory.MARRIAGE)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.MEDICAL}>
                            {getCategoryLabel(DocumentCategory.MEDICAL)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.LEGAL}>
                            {getCategoryLabel(DocumentCategory.LEGAL)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.FINANCIAL}>
                            {getCategoryLabel(DocumentCategory.FINANCIAL)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.EDUCATION}>
                            {getCategoryLabel(DocumentCategory.EDUCATION)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.EMPLOYMENT}>
                            {getCategoryLabel(DocumentCategory.EMPLOYMENT)}
                          </SelectItem>
                          <SelectItem value={DocumentCategory.OTHER}>
                            {getCategoryLabel(DocumentCategory.OTHER)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tags separated by commas" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tags help organize and search documents (e.g., "important, legal, 2024")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Document</FormLabel>
                        <FormDescription>
                          Make this document visible to all users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/members/${member.id}/documents`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading || uploadedFiles.length === 0}>
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documents
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
              <CardDescription>
                Choose the documents you want to upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                onUpload={handleFileUpload}
                placeholder="Drag and drop files here or click to browse"
                className="w-full"
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Selected Files:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadProgress[file.name] !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {uploadProgress[file.name]}%
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file)}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Guidelines</CardTitle>
              <CardDescription>
                Important information about document uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Supported Formats</p>
                    <p className="text-muted-foreground">
                      PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (Max 10MB per file)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Privacy Settings</p>
                    <p className="text-muted-foreground">
                      Choose whether documents are public or private
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Storage</p>
                    <p className="text-muted-foreground">
                      All documents are encrypted and securely stored
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 