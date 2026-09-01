'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Folder,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image,
  Video,
  Music,
  Download,
  Upload,
  Search,
  Plus,
  ArrowLeft,
  Calendar,
  Eye,
  Trash2,
  Share2,
  HardDrive,
} from 'lucide-react';

interface ChurchFile {
  id: string;
  name: string;
  category: 'Teaching Materials' | 'Financial Documents' | 'Administrative' | 'Media & Graphics' | 'Certificates';
  size: string;
  updatedAt: string;
  uploadedBy: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'mp4' | 'pptx';
}

const mockFiles: ChurchFile[] = [
  {
    id: 'f_001',
    name: '2026 Sunday School Curriculum - Primary.pdf',
    category: 'Teaching Materials',
    size: '4.2 MB',
    updatedAt: '2026-08-20',
    uploadedBy: 'Pastor John',
    fileType: 'pdf',
  },
  {
    id: 'f_002',
    name: 'Annual General Meeting Report 2025.pdf',
    category: 'Administrative',
    size: '12.8 MB',
    updatedAt: '2026-08-15',
    uploadedBy: 'Secretary Office',
    fileType: 'pdf',
  },
  {
    id: 'f_003',
    name: 'Q2 Financial Audit Statement.xlsx',
    category: 'Financial Documents',
    size: '850 KB',
    updatedAt: '2026-07-30',
    uploadedBy: 'Treasury Department',
    fileType: 'xlsx',
  },
  {
    id: 'f_004',
    name: 'Church Logo Pack & Brand Guidelines.zip',
    category: 'Media & Graphics',
    size: '45.0 MB',
    updatedAt: '2026-06-12',
    uploadedBy: 'Media Team',
    fileType: 'docx',
  },
  {
    id: 'f_005',
    name: 'Baptism Certificate Template 2026.docx',
    category: 'Certificates',
    size: '1.1 MB',
    updatedAt: '2026-05-10',
    uploadedBy: 'Administration',
    fileType: 'docx',
  },
  {
    id: 'f_006',
    name: 'Youth Camp 2026 Registration Packet.pdf',
    category: 'Teaching Materials',
    size: '3.4 MB',
    updatedAt: '2026-08-28',
    uploadedBy: 'Youth Ministry',
    fileType: 'pdf',
  },
];

export default function FilesRepositoryPage() {
  const [files, setFiles] = useState<ChurchFile[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<ChurchFile['category']>('Administrative');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      toast.error('Please enter a file title');
      return;
    }

    const newFile: ChurchFile = {
      id: `f_${Date.now()}`,
      name: newFileName.trim().endsWith('.pdf') ? newFileName.trim() : `${newFileName.trim()}.pdf`,
      category: newFileCategory,
      size: '2.4 MB',
      updatedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      fileType: 'pdf',
    };

    setFiles([newFile, ...files]);
    setUploadOpen(false);
    setNewFileName('');
    toast.success(`${newFile.name} uploaded successfully!`);
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || file.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Files & Documents Repository</h1>
            <p className="text-sm text-muted-foreground">Central storage for church teaching materials, financial archives, and assets</p>
          </div>
        </div>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload Document to Church Repository</span>
              </DialogTitle>
              <DialogDescription>
                Files will be securely stored and indexed for authorized ministry leaders.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpload} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="fileName">Document Name / Title *</Label>
                <Input
                  id="fileName"
                  placeholder="e.g. 2026 Leadership Handbook.pdf"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">File Category *</Label>
                <Select
                  value={newFileCategory}
                  onValueChange={(val: any) => setNewFileCategory(val)}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching Materials">Teaching Materials</SelectItem>
                    <SelectItem value="Financial Documents">Financial Documents</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Media & Graphics">Media & Graphics</SelectItem>
                    <SelectItem value="Certificates">Certificates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/40 transition cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Click to select file or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, MP4, JPG up to 100MB</p>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload File</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 cursor-pointer hover:border-primary/50 transition" onClick={() => setCategoryFilter('Teaching Materials')}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Teaching Materials</p>
              <p className="text-xs text-muted-foreground">18 Lesson Plans</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-primary/50 transition" onClick={() => setCategoryFilter('Administrative')}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Administrative</p>
              <p className="text-xs text-muted-foreground">24 Documents</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-primary/50 transition" onClick={() => setCategoryFilter('Financial Documents')}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Financial Records</p>
              <p className="text-xs text-muted-foreground">12 Reports</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-primary/50 transition" onClick={() => setCategoryFilter('Media & Graphics')}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Media & Assets</p>
              <p className="text-xs text-muted-foreground">35 Media Items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Teaching Materials">Teaching Materials</SelectItem>
                <SelectItem value="Administrative">Administrative</SelectItem>
                <SelectItem value="Financial Documents">Financial Records</SelectItem>
                <SelectItem value="Media & Graphics">Media & Graphics</SelectItem>
                <SelectItem value="Certificates">Certificates</SelectItem>
              </SelectContent>
            </Select>

            {categoryFilter !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setCategoryFilter('all')}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Files List Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/40 hover:border-primary/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{file.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60 text-xs text-muted-foreground">
                <span>{file.size}</span>
                <span>{file.updatedAt}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => toast.success(`Downloading ${file.name}`)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
