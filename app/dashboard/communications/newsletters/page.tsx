'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Send,
  Users,
  Calendar,
  Mail,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  status: string;
  template: string;
  subscribers: number;
  openRate: number;
  clickRate: number;
  scheduledDate: string | null;
  sentDate: string | null;
  createdAt: string;
  author: string;
  preview: string;
}

// Mock data for newsletters
const newsletters = [
  {
    id: '1',
    title: 'Weekly Church Update - January 2024',
    subject: 'This Week at EMC Church',
    status: 'sent',
    template: 'Weekly Update',
    subscribers: 450,
    openRate: 78,
    clickRate: 12,
    scheduledDate: '2024-01-15T08:00:00Z',
    sentDate: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    author: 'Communications Team',
    preview: 'Join us this Sunday for worship at 9:30 AM. Pastor John will be continuing our series on "Faith in Action"...'
  },
  {
    id: '2',
    title: 'Youth Ministry Newsletter',
    subject: 'Youth Group Updates & Events',
    status: 'scheduled',
    template: 'Youth Ministry',
    subscribers: 125,
    openRate: 0,
    clickRate: 0,
    scheduledDate: '2024-01-20T10:00:00Z',
    sentDate: null,
    createdAt: '2024-01-12T10:15:00Z',
    author: 'Sarah Wilson',
    preview: 'Exciting updates from our youth ministry including upcoming events, mission trips, and Bible study groups...'
  },
  {
    id: '3',
    title: 'Monthly Prayer Letter',
    subject: 'January Prayer Requests & Testimonies',
    status: 'draft',
    template: 'Prayer Letter',
    subscribers: 320,
    openRate: 0,
    clickRate: 0,
    scheduledDate: null,
    sentDate: null,
    createdAt: '2024-01-08T16:45:00Z',
    author: 'Elder Smith',
    preview: 'Dear prayer warriors, we want to share some amazing testimonies and current prayer needs with you...'
  },
  {
    id: '4',
    title: 'Christmas Special Edition',
    subject: 'Celebrating the Birth of Our Savior',
    status: 'sent',
    template: 'Holiday Special',
    subscribers: 520,
    openRate: 85,
    clickRate: 18,
    scheduledDate: '2023-12-24T06:00:00Z',
    sentDate: '2023-12-24T06:00:00Z',
    createdAt: '2023-12-20T11:20:00Z',
    author: 'Pastor John',
    preview: 'As we celebrate the birth of Jesus Christ, we reflect on the greatest gift ever given to humanity...'
  }
];

const summaryStats = {
  totalNewsletters: 4,
  sent: 2,
  scheduled: 1,
  drafts: 1,
  totalSubscribers: 1415,
  avgOpenRate: 54
};

export default function NewslettersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const deleteDialog = useDeleteDialog();
  const [sendDialog, setSendDialog] = useState<{ isOpen: boolean; newsletter: Newsletter | null }>({ isOpen: false, newsletter: null });
  const [isSending, setIsSending] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || newsletter.status === statusFilter;
    const matchesTemplate = templateFilter === 'all' || newsletter.template === templateFilter;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const handleDelete = (newsletter: any) => {
    deleteDialog.openDialog(newsletter);
  };

  const handleSendNow = (newsletter: any) => {
    setSendDialog({ isOpen: true, newsletter });
  };

  const confirmSendNewsletter = async () => {
    if (!sendDialog.newsletter) return;

    setIsSending(true);
    try {
      // Simulate API call to send newsletter
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update newsletter status in the local state
      const targetId = sendDialog.newsletter.id;
      const updatedNewsletters = newsletters.map(newsletter =>
        newsletter.id === targetId
          ? {
            ...newsletter,
            status: 'sent',
            sentDate: new Date().toISOString()
          }
          : newsletter
      );

      toast.success(`Newsletter "${sendDialog.newsletter.title}" sent successfully!`);
      setSendDialog({ isOpen: false, newsletter: null });

      // In a real app, you would update the state or refetch data
      // For now, we'll just close the dialog
    } catch (error) {
      toast.error('Failed to send newsletter. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDuplicate = (id: string) => {
    // Handle duplicate logic here
    console.log('Duplicating newsletter:', id);
    // In real app, this would create a copy and redirect to edit
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Newsletters</h1>
            <p className="text-muted-foreground">Create and manage church newsletters</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalNewsletters}</div>
            <p className="text-xs text-muted-foreground">All newsletters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.sent}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">Email engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="Weekly Update">Weekly Update</SelectItem>
              <SelectItem value="Youth Ministry">Youth Ministry</SelectItem>
              <SelectItem value="Prayer Letter">Prayer Letter</SelectItem>
              <SelectItem value="Holiday Special">Holiday Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push('/dashboard/communications/newsletters/add')}>
          <Plus className="mr-2 h-4 w-4" />
          New Newsletter
        </Button>
      </div>

      {/* Newsletters Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Newsletters</CardTitle>
          <CardDescription>Manage and track your church newsletters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Newsletter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Scheduled/Sent</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNewsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{newsletter.title}</div>
                      <div className="text-sm text-muted-foreground">{newsletter.subject}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                        {newsletter.preview}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(newsletter.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(newsletter.status)}
                      {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{newsletter.template}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {newsletter.subscribers}
                    </div>
                  </TableCell>
                  <TableCell>
                    {newsletter.status === 'sent' ? (
                      <div className="space-y-1">
                        <div className={`font-medium ${getEngagementColor(newsletter.openRate)}`}>
                          {newsletter.openRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {newsletter.clickRate}% clicks
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {newsletter.status === 'sent'
                          ? formatDate(newsletter.sentDate)
                          : formatDate(newsletter.scheduledDate)
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{newsletter.author}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/newsletters/${newsletter.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/newsletters/${newsletter.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {newsletter.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleSendNow(newsletter)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(newsletter.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(newsletter)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(async (newsletter) => {
          // Add actual delete logic here
          console.log('Deleting newsletter:', newsletter.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Newsletter"
        itemName={deleteDialog.itemToDelete?.title}
        loading={deleteDialog.loading}
      />

      {/* Send Confirmation Dialog */}
      <AlertDialog open={sendDialog.isOpen} onOpenChange={(open) => !open && setSendDialog({ isOpen: false, newsletter: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-brand-primary" />
              Send Newsletter Now?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to send <strong>"{sendDialog.newsletter?.title}"</strong> now?
              </p>
              <p className="text-sm text-muted-foreground">
                This newsletter will be sent to <strong>{sendDialog.newsletter?.subscribers}</strong> subscribers immediately.
              </p>
              <p className="text-sm text-yellow-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendNewsletter}
              disabled={isSending}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {isSending ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Now
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}