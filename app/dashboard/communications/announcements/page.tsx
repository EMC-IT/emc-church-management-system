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
import { 
  ArrowLeft,
  Megaphone,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for announcements
const INITIAL_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Sunday Service Update',
    content: 'Please note that this Sunday\'s service will start at 10:00 AM instead of the usual 9:30 AM.',
    status: 'published',
    priority: 'high',
    targetAudience: 'All Members',
    scheduledDate: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    author: 'Pastor John',
    views: 245,
    engagement: 89
  },
  {
    id: '2',
    title: 'Youth Group Meeting',
    content: 'Youth group will meet this Friday at 7 PM in the fellowship hall for games and Bible study.',
    status: 'scheduled',
    priority: 'medium',
    targetAudience: 'Youth Group',
    scheduledDate: '2024-01-20T19:00:00Z',
    createdAt: '2024-01-12T10:15:00Z',
    author: 'Sarah Wilson',
    views: 67,
    engagement: 23
  },
  {
    id: '3',
    title: 'Church Picnic Announcement',
    content: 'Join us for our annual church picnic on Saturday, February 3rd at Riverside Park.',
    status: 'draft',
    priority: 'low',
    targetAudience: 'All Members',
    scheduledDate: '2024-02-01T08:00:00Z',
    createdAt: '2024-01-08T16:45:00Z',
    author: 'Mary Johnson',
    views: 12,
    engagement: 3
  },
  {
    id: '4',
    title: 'Prayer Meeting Reminder',
    content: 'Don\'t forget our weekly prayer meeting every Wednesday at 6:30 PM.',
    status: 'published',
    priority: 'medium',
    targetAudience: 'Prayer Group',
    scheduledDate: '2024-01-17T18:30:00Z',
    createdAt: '2024-01-14T11:20:00Z',
    author: 'Elder Smith',
    views: 156,
    engagement: 45
  }
];

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcementsList, setAnnouncementsList] = useState(INITIAL_ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const deleteDialog = useDeleteDialog();

  const filteredAnnouncements = announcementsList.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDeleteAnnouncement = async () => {
    if (!deleteDialog.itemToDelete) return;
    setAnnouncementsList(prev => prev.filter(a => a.id !== deleteDialog.itemToDelete.id));
    toast.success('Announcement deleted successfully');
    deleteDialog.closeDialog();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Announcements"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/communications">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Communications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/communications/announcements/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Announcement
              </Link>
            </Button>
          </>
        }
      />

      {/* 4 Summary StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Announcements"
          value={announcementsList.length}
          icon={Megaphone}
          accent="primary"
        />
        <StatCard
          title="Published"
          value={announcementsList.filter(a => a.status === 'published').length}
          icon={CheckCircle}
          accent="success"
        />
        <StatCard
          title="Scheduled"
          value={announcementsList.filter(a => a.status === 'scheduled').length}
          icon={Clock}
          accent="accent"
        />
        <StatCard
          title="Total Views"
          value={announcementsList.reduce((sum, a) => sum + a.views, 0)}
          icon={Activity}
          accent="secondary"
        />
      </div>

      {/* Announcements Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">All Announcements</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{announcement.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-sm">
                          {announcement.content}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{announcement.targetAudience}</TableCell>
                    <TableCell>
                      <StatusBadge status={announcement.status} />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={announcement.priority === 'high' ? 'danger' : announcement.priority === 'medium' ? 'warning' : 'neutral'}
                        className="text-xs capitalize"
                      >
                        {announcement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{announcement.views}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/communications/announcements/${announcement.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/communications/announcements/${announcement.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteDialog.openDialog(announcement)}
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
        onConfirm={handleDeleteAnnouncement}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement?"
        itemName={deleteDialog.itemToDelete?.title}
      />
    </div>
  );
}