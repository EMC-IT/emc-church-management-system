'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Download,
  Share2,
  Eye,
  Calendar,
  User,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  File,
  Loader2,
  Star,
  MessageSquare,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { TeachingMaterial } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function MaterialDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;
  
  const [material, setMaterial] = useState<TeachingMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
    } catch (error) {
      toast.error('Failed to load material');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/sunday-school/materials');
  };

  const handleDownload = async () => {
    if (!material) return;
    
    try {
      setDownloading(true);
      // In a real app, this would trigger a download and update download count
      window.open(material.fileUrl, '_blank');
      
      // Update download count
      setMaterial(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download material');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!material) return;
    
    try {
      await navigator.share({
        title: material.title,
        text: material.description,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lesson':
      case 'worksheet':
        return <FileText className="h-6 w-6 text-brand-primary" />;
      case 'image':
        return <Image className="h-6 w-6 text-brand-secondary" />;
      case 'video':
        return <Video className="h-6 w-6 text-brand-accent" />;
      case 'audio':
        return <Music className="h-6 w-6 text-brand-success" />;
      default:
        return <File className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const formatFileSize = (sizeInBytes?: number) => {
    if (!sizeInBytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeInBytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getRelatedMaterials = () => {
    // Mock related materials - in a real app, this would come from the API
    return [
      {
        id: '1',
        title: 'David and Goliath Activity Sheet',
        type: 'Worksheet',
        downloadCount: 45
      },
      {
        id: '2',
        title: 'Bible Heroes Coloring Pages',
        type: 'Image',
        downloadCount: 32
      },
      {
        id: '3',
        title: 'Courage Songs for Kids',
        type: 'Audio',
        downloadCount: 28
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Material Not Found</h2>
          <p className="text-muted-foreground mt-2">The material you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Materials
          </Button>
        </div>
      </div>
    );
  }

  const relatedMaterials = getRelatedMaterials();

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
              <h1 className="text-3xl font-bold tracking-tight">{material.title}</h1>
              <p className="text-muted-foreground">Teaching Material Details</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Material Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getFileIcon(material.type)}
                <span>Material Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {material.type.toLowerCase() === 'image' ? (
                  <img 
                    src={material.fileUrl} 
                    alt={material.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : material.type.toLowerCase() === 'video' ? (
                  <video 
                    controls 
                    className="max-w-full max-h-full rounded-lg"

                  >
                    <source src={material.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-center">
                    {getFileIcon(material.type)}
                    <p className="mt-2 text-sm text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <Button className="mt-2" onClick={handleDownload}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{material.description}</p>
            </CardContent>
          </Card>

          {/* Comments & Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Comments & Ratings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= 4 ? 'fill-brand-accent text-brand-accent' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">4.2 out of 5</p>
                    <p className="text-sm text-muted-foreground">Based on 12 reviews</p>
                  </div>
                </div>

                {/* Sample Comments */}
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm">Sarah Miller</h4>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${star <= 5 ? 'fill-brand-accent text-brand-accent' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Excellent resource! The kids loved the interactive elements and it really helped them understand the lesson.
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            5
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-sm">John Davis</h4>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${star <= 4 ? 'fill-brand-accent text-brand-accent' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">1 week ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Great material, though I wish there were more activities for younger children.
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            2
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Material Info */}
          <Card>
            <CardHeader>
              <CardTitle>Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Type:</span>
                  <Badge variant="outline">{material.type}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Age Group:</span>
                  <span className="text-sm">{material.ageGroup}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">File Size:</span>
                  <span className="text-sm">{formatFileSize(material.fileSize)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Downloads:</span>
                  <span className="text-sm font-semibold">{material.downloadCount}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(material.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Uploaded by</p>
                    <p className="text-xs text-muted-foreground">{material.uploadedBy.name}</p>
                  </div>
                </div>
              </div>
              
              {material.tags && material.tags.length > 0 && (
                <div>
                  <Separator className="mb-3" />
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {material.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Usage Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Views this week:</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Downloads this month:</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average rating:</span>
                <span className="font-semibold">4.2/5</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Related Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedMaterials.map((related) => (
                  <div key={related.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                    {getFileIcon(related.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{related.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {related.downloadCount} downloads
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}