'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload, 
  Search, 
  Download,
  Eye,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Music,
  File,
  Loader2,
  BookOpen,
  TrendingUp,
  Calendar,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { TeachingMaterial, MaterialType, AgeGroup } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const materialTypes = Object.values(MaterialType);
const ageGroups = Object.values(AgeGroup);

export default function MaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getMaterials({
        search: searchTerm || undefined,
        type: typeFilter !== 'All' ? typeFilter as MaterialType : undefined,
        ageGroup: ageGroupFilter !== 'All' ? ageGroupFilter as AgeGroup : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setMaterials(response.data);
      } else {
        toast.error(response.message || 'Failed to load materials');
      }
    } catch (error) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMaterials();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, ageGroupFilter]);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || material.type === typeFilter;
    const matchesAgeGroup = ageGroupFilter === 'All' || material.ageGroup === ageGroupFilter;
    
    return matchesSearch && matchesType && matchesAgeGroup;
  });

  const getStats = () => {
    const totalMaterials = materials.length;
    const recentUploads = materials.filter(m => {
      const uploadDate = new Date(m.uploadDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return uploadDate >= sevenDaysAgo;
    }).length;
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloadCount, 0);
    const popularMaterials = materials.filter(m => m.downloadCount > 10).length;

    return { totalMaterials, recentUploads, totalDownloads, popularMaterials };
  };

  const stats = getStats();

  const getFileIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.LESSON_PLAN:
      case MaterialType.WORKSHEET:
        return <FileText className="h-8 w-8 text-brand-primary" />;
      case MaterialType.PRESENTATION:
        return <Image className="h-8 w-8 text-brand-secondary" />;
      case MaterialType.VIDEO:
        return <Video className="h-8 w-8 text-brand-accent" />;
      case MaterialType.AUDIO:
        return <Music className="h-8 w-8 text-brand-success" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const handleViewMaterial = (materialId: string) => {
    router.push(`/dashboard/sunday-school/materials/${materialId}`);
  };

  const handleDownloadMaterial = async (material: TeachingMaterial) => {
    try {
      // In a real app, this would trigger a download
      window.open(material.fileUrl, '_blank');
      toast.success(`Downloading ${material.title}`);
    } catch (error) {
      toast.error('Failed to download material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await sundaySchoolService.deleteMaterial(materialId);
      if (response.success) {
        toast.success('Material deleted successfully');
        loadMaterials();
      } else {
        toast.error(response.message || 'Failed to delete material');
      }
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  const handleUploadMaterial = () => {
    router.push('/dashboard/sunday-school/materials/upload');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teaching Materials</h1>
          <p className="text-muted-foreground">Manage Sunday School teaching resources</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleUploadMaterial}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Material
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Materials</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.popularMaterials}</div>
            <p className="text-xs text-muted-foreground">10+ downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials Library */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Library</CardTitle>
          <CardDescription>Browse and manage teaching materials</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Age Groups</SelectItem>
                {ageGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(material.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{material.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {material.description}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewMaterial(material.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadMaterial(material)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline">{material.type}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Age Group:</span>
                      <span className="font-medium">{material.ageGroup}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Downloads:</span>
                      <span className="font-medium">{material.downloadCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploaded:</span>
                      <span className="font-medium">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>By:</span>
                      <span className="font-medium">{material.uploadedBy.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4 border-t mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMaterial(material.id)}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDownloadMaterial(material)}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No materials found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'All' || ageGroupFilter !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'No materials have been uploaded yet'
                }
              </p>
              {!searchTerm && typeFilter === 'All' && ageGroupFilter === 'All' && (
                <Button onClick={handleUploadMaterial}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Material
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}