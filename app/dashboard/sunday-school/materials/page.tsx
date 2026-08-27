'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload, 
  Search, 
  Download,
  MoreHorizontal,
  FileText,
  Video,
  Music,
  File,
  Loader2,
  BookOpen,
  ArrowLeft,
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
    } catch {
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

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await sundaySchoolService.deleteMaterial(materialId);
      if (response.success) {
        toast.success('Material deleted successfully');
        setMaterials(prev => prev.filter(m => m.id !== materialId));
      } else {
        toast.error(response.message || 'Failed to delete material');
      }
    } catch {
      toast.error('Failed to delete material');
    }
  };

  const getFileIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.VIDEO:
        return <Video className="h-5 w-5" />;
      case MaterialType.AUDIO:
        return <Music className="h-5 w-5" />;
      case MaterialType.LESSON_PLAN:
      case MaterialType.WORKSHEET:
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || material.type === typeFilter;
    const matchesAgeGroup = ageGroupFilter === 'All' || material.ageGroup === ageGroupFilter;
    return matchesSearch && matchesType && matchesAgeGroup;
  });

  const totalDownloads = materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/sunday-school" aria-label="Back to Sunday School">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Teaching Materials</h1>
        </div>

        <Button size="sm" asChild>
          <Link href="/dashboard/sunday-school/materials/upload">
            <Upload className="mr-1.5 h-4 w-4" />
            Upload Material
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Resources" value={materials.length} icon={BookOpen} />
        <StatCard title="Lesson Plans" value={materials.filter(m => m.type === MaterialType.LESSON_PLAN).length} icon={FileText} />
        <StatCard title="Total Downloads" value={totalDownloads} icon={Download} />
        <StatCard
          title="Media Materials"
          value={materials.filter(m => m.type === MaterialType.VIDEO || m.type === MaterialType.AUDIO).length}
          icon={Video}
        />
      </div>

      {/* Materials Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Materials Library ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials by title or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Age Groups</SelectItem>
                {ageGroups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {getFileIcon(material.type)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sunday-school/materials/${material.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {material.fileUrl && (
                          <DropdownMenuItem onClick={() => window.open(material.fileUrl, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1">{material.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{material.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Badge variant="neutral" size="sm">{material.ageGroup}</Badge>
                    <Badge variant="neutral" size="sm">{material.type}</Badge>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{material.downloadCount || 0} downloads</span>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary hover:bg-transparent" asChild>
                    <Link href={`/dashboard/sunday-school/materials/${material.id}`}>
                      View Resource
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No materials found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}