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
import { 
  ArrowLeft,
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Mock data for announcements
const announcements = [
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

const summaryStats = {
  totalAnnouncements: 4,
  published: 2,
  scheduled: 1,
  drafts: 1,
  totalViews: 480,
  avgEngagement: 40
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const deleteDialog = useDeleteDialog();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = (announcement: any) => {
    deleteDialog.openDialog(announcement);
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
            <Megaphone className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">Manage church announcements and notifications</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Active announcements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.published}</div>
            <p className="text-xs text-muted-foreground">Live announcements</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Across all announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
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
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
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
        <Button onClick={() => router.push('/dashboard/communications/announcements/add')}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Manage and track your church announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{announcement.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {announcement.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(announcement.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(announcement.status)}
                      {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(announcement.priority)}>
                      {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {announcement.targetAudience}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(announcement.scheduledDate)}
                    </div>
                  </TableCell>
                  <TableCell>{announcement.views}</TableCell>
                  <TableCell>{announcement.author}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/announcements/${announcement.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/announcements/${announcement.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(announcement)}
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
        onConfirm={() => deleteDialog.handleConfirm(async (announcement) => {
          // Add actual delete logic here
          console.log('Deleting announcement:', announcement.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Announcement"
        itemName={deleteDialog.itemToDelete?.title}
        loading={deleteDialog.loading}
      />
    </div>
  );
}