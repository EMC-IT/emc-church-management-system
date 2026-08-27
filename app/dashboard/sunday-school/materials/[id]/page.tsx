'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  Tag,
  FileText,
  Video,
  Music,
  File,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { TeachingMaterial, MaterialType } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function MaterialDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;
  
  const [material, setMaterial] = useState<TeachingMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getMaterial(materialId);
      if (response.success && response.data) {
        setMaterial(response.data);
      } else {
        toast.error('Material not found');
        router.push('/dashboard/sunday-school/materials');
      }
    } catch {
      toast.error('Failed to load material');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!material?.fileUrl) return;
    window.open(material.fileUrl, '_blank');
    setMaterial(prev => prev ? { ...prev, downloadCount: (prev.downloadCount || 0) + 1 } : null);
    toast.success('Download started');
  };

  const handleShare = async () => {
    if (!material) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: material.title,
          text: material.description,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const getFileIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'lesson_plan':
      case 'worksheet':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown size';
    const mb = sizeInBytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold">Material Not Found</h2>
        <Button onClick={() => router.push('/dashboard/sunday-school/materials')} variant="outline">
          Back to Materials
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/sunday-school/materials" aria-label="Back to Materials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{material.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-1.5 h-4 w-4" />
            Share
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-4 w-4" />
            Download Resource
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Overview & Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-foreground leading-relaxed">
              {material.description || 'No description provided.'}
            </p>

            {material.tags && material.tags.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {material.tags.map((tag) => (
                    <Badge key={tag} variant="neutral" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Type</span>
              <Badge variant="neutral" size="sm">{material.type}</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Target Age</span>
              <span className="font-medium text-foreground">{material.ageGroup}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">File Size</span>
              <span className="font-medium text-foreground">{formatFileSize(material.fileSize)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Downloads</span>
              <span className="font-medium text-foreground">{material.downloadCount || 0}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Uploaded On</span>
              <span className="font-medium text-foreground">
                {material.uploadDate ? new Date(material.uploadDate).toLocaleDateString() : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}