'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
  ArrowLeft,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Send,
  Users,
  CheckCircle,
  Clock,
  Activity,
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

const INITIAL_NEWSLETTERS: Newsletter[] = [
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

export default function NewslettersPage() {
  const router = useRouter();
  const [newslettersList, setNewslettersList] = useState<Newsletter[]>(INITIAL_NEWSLETTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const deleteDialog = useDeleteDialog();

  const filteredNewsletters = newslettersList.filter(newsletter => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || newsletter.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteNewsletter = async () => {
    if (!deleteDialog.itemToDelete) return;
    setNewslettersList(prev => prev.filter(n => n.id !== deleteDialog.itemToDelete.id));
    toast.success('Newsletter deleted successfully');
    deleteDialog.closeDialog();
  };

  const handleSendNow = async (newsletter: Newsletter) => {
    toast.success(`Newsletter "${newsletter.title}" sent to ${newsletter.subscribers} subscribers!`);
    setNewslettersList(prev => prev.map(n => n.id === newsletter.id ? { ...n, status: 'sent', sentDate: new Date().toISOString() } : n));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Newsletters"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/communications">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Communications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/communications/newsletters/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Newsletter
              </Link>
            </Button>
          </>
        }
      />

      {/* 4 Summary StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Newsletters"
          value={newslettersList.length}
          icon={FileText}
          accent="primary"
        />
        <StatCard
          title="Sent Publications"
          value={newslettersList.filter(n => n.status === 'sent').length}
          icon={CheckCircle}
          accent="success"
        />
        <StatCard
          title="Total Subscribers"
          value={newslettersList.reduce((sum, n) => sum + n.subscribers, 0)}
          icon={Users}
          accent="accent"
        />
        <StatCard
          title="Average Open Rate"
          value="81.5%"
          icon={Activity}
          accent="secondary"
        />
      </div>

      {/* Newsletters Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">All Newsletters</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search newsletters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-60"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Newsletter</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNewsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{newsletter.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {newsletter.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" className="text-xs">{newsletter.template}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={newsletter.status} />
                    </TableCell>
                    <TableCell className="text-sm font-medium">{newsletter.subscribers}</TableCell>
                    <TableCell className="text-sm">
                      {newsletter.status === 'sent' ? `${newsletter.openRate}%` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {newsletter.status === 'sent' ? `${newsletter.clickRate}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/communications/newsletters/${newsletter.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Newsletter
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/communications/newsletters/${newsletter.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {newsletter.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendNow(newsletter)}>
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteDialog.openDialog(newsletter)}
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
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDeleteNewsletter}
        title="Delete Newsletter"
        description="Are you sure you want to delete this newsletter draft?"
        itemName={deleteDialog.itemToDelete?.title}
      />
    </div>
  );
}