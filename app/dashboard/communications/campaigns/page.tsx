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
  Send,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  MousePointer
} from 'lucide-react';

// Mock data for campaigns
const campaigns = [
  {
    id: '1',
    name: 'Sunday Service Reminder',
    type: 'sms',
    status: 'completed',
    message: 'Don\'t forget about Sunday service at 9:30 AM! We\'re excited to see you there. 🙏',
    targetAudience: 'All Members',
    scheduledDate: '2024-01-14T08:00:00Z',
    sentDate: '2024-01-14T08:00:00Z',
    createdAt: '2024-01-10T14:30:00Z',
    author: 'Communications Team',
    stats: {
      sent: 450,
      delivered: 445,
      opened: 320,
      clicked: 45,
      deliveryRate: 98.9,
      openRate: 71.9,
      clickRate: 10.0
    }
  },
  {
    id: '2',
    name: 'Youth Event Invitation',
    type: 'email',
    status: 'scheduled',
    message: 'Join us for an amazing youth event this Friday! Games, food, and fellowship await.',
    targetAudience: 'Youth Group',
    scheduledDate: '2024-01-20T10:00:00Z',
    sentDate: null,
    createdAt: '2024-01-12T10:15:00Z',
    author: 'Sarah Wilson',
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0
    }
  },
  {
    id: '3',
    name: 'Prayer Meeting Notification',
    type: 'sms',
    status: 'draft',
    message: 'Join us for prayer meeting this Wednesday at 6:30 PM. Your prayers make a difference!',
    targetAudience: 'Prayer Group',
    scheduledDate: null,
    sentDate: null,
    createdAt: '2024-01-08T16:45:00Z',
    author: 'Elder Smith',
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0
    }
  },
  {
    id: '4',
    name: 'Christmas Service Announcement',
    type: 'email',
    status: 'completed',
    message: 'Celebrate the birth of our Savior with us! Special Christmas service on December 24th.',
    targetAudience: 'All Members',
    scheduledDate: '2023-12-20T09:00:00Z',
    sentDate: '2023-12-20T09:00:00Z',
    createdAt: '2023-12-18T11:20:00Z',
    author: 'Pastor John',
    stats: {
      sent: 520,
      delivered: 515,
      opened: 425,
      clicked: 78,
      deliveryRate: 99.0,
      openRate: 82.5,
      clickRate: 15.1
    }
  }
];

const summaryStats = {
  totalCampaigns: 4,
  completed: 2,
  scheduled: 1,
  drafts: 1,
  totalSent: 970,
  avgOpenRate: 51
};

export default function CampaignsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const deleteDialog = useDeleteDialog();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      case 'sending': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'default';
      case 'sms': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      case 'sending': return <Send className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (campaign: any) => {
    deleteDialog.openDialog(campaign);
  };

  const handleDuplicate = (id: string) => {
    // Handle duplicate logic here
    console.log('Duplicating campaign:', id);
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
            <Send className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">Manage SMS and email campaigns</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully sent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalSent}</div>
            <p className="text-xs text-muted-foreground">Messages delivered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">Campaign engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push('/dashboard/communications/campaigns/add')}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Manage and track your communication campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Scheduled/Sent</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{campaign.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {campaign.message}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(campaign.type)} className="flex items-center gap-1 w-fit">
                      {getTypeIcon(campaign.type)}
                      {campaign.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(campaign.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(campaign.status)}
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {campaign.targetAudience}
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.status === 'completed' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className={`text-sm font-medium ${getEngagementColor(campaign.stats.openRate)}`}>
                            {campaign.stats.openRate}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {campaign.stats.clickRate}% clicks
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {campaign.status === 'completed' 
                          ? formatDate(campaign.sentDate)
                          : formatDate(campaign.scheduledDate)
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.author}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/campaigns/${campaign.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/communications/campaigns/${campaign.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(campaign.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(campaign)}
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
        onConfirm={() => deleteDialog.handleConfirm(async (campaign) => {
          // Add actual delete logic here
          console.log('Deleting campaign:', campaign.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Campaign"
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}