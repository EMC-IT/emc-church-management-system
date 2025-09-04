'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { documentsService } from '@/services';
import { Document, DocumentCategory, Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Download,
  Eye,
  Edit,
  Trash2,
  Share2,
  Upload,
  FolderOpen,
  Calendar,
  User,
  HardDrive,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

// Mock documents data for development
const mockDocuments: Document[] = [
  {
    id: '1',
    memberId: '1',
    title: 'National ID Card',
    description: 'Government issued identification card',
    category: DocumentCategory.IDENTIFICATION,
    fileName: 'national_id_card.pdf',
    fileSize: 2048576, // 2MB
    fileType: 'application/pdf',
    fileUrl: '/documents/national_id_card.pdf',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    isPublic: false,
    tags: ['identification', 'government', 'required'],
    metadata: {
      expiryDate: '2029-12-31',
      documentNumber: 'GH-123456789-0'
    }
  },
  {
    id: '2',
    memberId: '1',
    title: 'Baptism Certificate',
    description: 'Certificate of baptism from St. Mary\'s Church',
    category: DocumentCategory.BAPTISM,
    fileName: 'baptism_certificate.pdf',
    fileSize: 1048576, // 1MB
    fileType: 'application/pdf',
    fileUrl: '/documents/baptism_certificate.pdf',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    isPublic: true,
    tags: ['baptism', 'certificate', 'church'],
    metadata: {
      baptismDate: '1995-06-20',
      church: 'St. Mary\'s Church',
      officiant: 'Rev. Michael Johnson'
    }
  },
  {
    id: '3',
    memberId: '1',
    title: 'Medical Certificate',
    description: 'Annual medical checkup certificate',
    category: DocumentCategory.MEDICAL,
    fileName: 'medical_certificate.pdf',
    fileSize: 3145728, // 3MB
    fileType: 'application/pdf',
    fileUrl: '/documents/medical_certificate.pdf',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
    isPublic: false,
    tags: ['medical', 'health', 'annual'],
    metadata: {
      issueDate: '2024-01-05',
      doctor: 'Dr. Sarah Williams',
      hospital: 'Accra General Hospital'
    }
  },
  {
    id: '4',
    memberId: '1',
    title: 'Employment Contract',
    description: 'Employment contract with Tech Solutions Ltd',
    category: DocumentCategory.EMPLOYMENT,
    fileName: 'employment_contract.pdf',
    fileSize: 5242880, // 5MB
    fileType: 'application/pdf',
    fileUrl: '/documents/employment_contract.pdf',
    uploadedBy: 'John Smith',
    uploadedAt: '2023-12-20T16:45:00Z',
    updatedAt: '2023-12-20T16:45:00Z',
    isPublic: false,
    tags: ['employment', 'contract', 'work'],
    metadata: {
      startDate: '2023-12-01',
      company: 'Tech Solutions Ltd',
      position: 'Software Engineer'
    }
  },
  {
    id: '5',
    memberId: '1',
    title: 'Marriage Certificate',
    description: 'Marriage certificate from civil registry',
    category: DocumentCategory.MARRIAGE,
    fileName: 'marriage_certificate.pdf',
    fileSize: 1572864, // 1.5MB
    fileType: 'application/pdf',
    fileUrl: '/documents/marriage_certificate.pdf',
    uploadedBy: 'John Smith',
    uploadedAt: '2023-11-15T11:30:00Z',
    updatedAt: '2023-11-15T11:30:00Z',
    isPublic: true,
    tags: ['marriage', 'certificate', 'legal'],
    metadata: {
      marriageDate: '2020-08-15',
      spouse: 'Jane Smith',
      registry: 'Accra Civil Registry'
    }
  }
];

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

export default function DocumentsPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, documentsResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   documentsService.getMemberDocuments(memberId)
        // ]);
        // setMember(memberResponse);
        // setDocuments(documentsResponse.data);
        setMember(mockMember);
        setDocuments(mockDocuments);
      } catch (err: any) {
        setError(err.message || 'Failed to load documents');
        toast({
          title: 'Error',
          description: 'Failed to load documents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadData();
    }
  }, [memberId, toast]);

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentsService.deleteDocument(documentId);
      setDocuments(documents.filter(d => d.id !== documentId));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    try {
      await documentsService.bulkDeleteDocuments(selectedDocuments);
      setDocuments(documents.filter(d => !selectedDocuments.includes(d.id)));
      setSelectedDocuments([]);
      toast({
        title: 'Success',
        description: `${selectedDocuments.length} document(s) deleted successfully`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete documents',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentsService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleShareDocument = async (doc: Document) => {
    try {
      const shareData = await documentsService.shareDocument(doc.id, {
        permission: 'view',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
      
      // Copy share URL to clipboard
      await navigator.clipboard.writeText(shareData.shareUrl);
      
      toast({
        title: 'Success',
        description: 'Share link copied to clipboard',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to share document',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.IDENTIFICATION:
        return <User className="h-4 w-4" />;
      case DocumentCategory.BAPTISM:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.CONFIRMATION:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.MARRIAGE:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.MEDICAL:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.LEGAL:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.FINANCIAL:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.EDUCATION:
        return <FileText className="h-4 w-4" />;
      case DocumentCategory.EMPLOYMENT:
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: DocumentCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Table columns definition
  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'title',
      header: 'Document',
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getCategoryIcon(document.category)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{document.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {document.description || 'No description'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as DocumentCategory;
        return (
          <Badge variant="outline">
            {getCategoryLabel(category)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }) => {
        const fileSize = row.getValue('fileSize') as number;
        return <span className="text-sm">{formatFileSize(fileSize)}</span>;
      },
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Uploaded',
      cell: ({ row }) => {
        const uploadedAt = row.getValue('uploadedAt') as string;
        return (
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
            {formatDate(uploadedAt)}
          </div>
        );
      },
    },
    {
      accessorKey: 'isPublic',
      header: 'Visibility',
      cell: ({ row }) => {
        const isPublic = row.getValue('isPublic') as boolean;
        return (
          <Badge variant={isPublic ? 'default' : 'secondary'}>
            {isPublic ? 'Public' : 'Private'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const document = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadDocument(document)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShareDocument(document)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/members/${memberId}/documents/${document.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteDocument(document.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

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
            <Link href={`/dashboard/members/${member.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage documents for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBulkDelete} disabled={selectedDocuments.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedDocuments.length})
          </Button>
          <Button asChild>
            <Link href={`/dashboard/members/${member.id}/documents/upload`}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </div>

      {/* Documents Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              All document types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(documents.reduce((total, doc) => total + doc.fileSize, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined file size
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Documents</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => d.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Visible to all
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(documents.map(d => d.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Document categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            View and manage all documents for {member.firstName} {member.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <DataTable
              columns={columns}
              data={documents}
              loading={loading}
              error={error || undefined}
              searchKey="title"
              showSearch={true}
              showFilters={true}
              pagination={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50],
              }}
              onRowClick={(document) => router.push(`/dashboard/members/${memberId}/documents/${document.id}`)}
              className="bg-card"
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading documents for this member
              </p>
              <Button asChild>
                <Link href={`/dashboard/members/${member.id}/documents/upload`}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 