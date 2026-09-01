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
  Send,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Smartphone,
  CheckCircle,
  Activity,
  BarChart3,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for campaigns
const INITIAL_CAMPAIGNS = [
  {
    id: '1',
    name: 'Sunday Service Reminder',
    type: 'sms',
    status: 'completed',
    message: 'Don\'t forget about Sunday service at 9:30 AM! We\'re excited to see you there.',
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

export default function CampaignsPage() {
  const router = useRouter();
  const [campaignsList, setCampaignsList] = useState(INITIAL_CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const deleteDialog = useDeleteDialog();

  const filteredCampaigns = campaignsList.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteCampaign = async () => {
    if (!deleteDialog.itemToDelete) return;
    setCampaignsList(prev => prev.filter(c => c.id !== deleteDialog.itemToDelete.id));
    toast.success('Campaign deleted successfully');
    deleteDialog.closeDialog();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Campaigns"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/communications">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Communications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/communications/campaigns/add">
                <Plus className="mr-1.5 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </>
        }
      />

      {/* 4 Summary StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Campaigns"
          value={campaignsList.length}
          icon={Send}
          accent="primary"
        />
        <StatCard
          title="Completed"
          value={campaignsList.filter(c => c.status === 'completed').length}
          icon={CheckCircle}
          accent="success"
        />
        <StatCard
          title="Total Recipients"
          value={campaignsList.reduce((sum, c) => sum + c.stats.sent, 0)}
          icon={Users}
          accent="accent"
        />
        <StatCard
          title="Avg Delivery Rate"
          value="98.9%"
          icon={Activity}
          accent="secondary"
        />
      </div>

      {/* Campaigns Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">All Campaigns</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-60"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
                  <TableHead>Campaign</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-sm">
                          {campaign.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" className="capitalize text-xs font-normal">
                        {campaign.type === 'email' ? <Mail className="mr-1 h-3 w-3" /> : <Smartphone className="mr-1 h-3 w-3" />}
                        {campaign.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{campaign.targetAudience}</TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {campaign.stats.delivered} / {campaign.stats.sent}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {campaign.type === 'email' && campaign.stats.openRate ? `${campaign.stats.openRate}%` : '-'}
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
                            <Link href={`/dashboard/communications/campaigns/${campaign.id}`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/communications/campaigns/${campaign.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteDialog.openDialog(campaign)}
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
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? Historical delivery records will be preserved."
        itemName={deleteDialog.itemToDelete?.name}
      />
    </div>
  );
}