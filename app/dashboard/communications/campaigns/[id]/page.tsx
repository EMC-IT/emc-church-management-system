'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Send,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Users,
  Eye,
  Mail,
  MessageSquare,
  MousePointer,
  TrendingUp,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  BarChart3,
  Smartphone,
  AtSign,
  Target
} from 'lucide-react';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';

// Mock data - in real app, this would come from API
const mockCampaign = {
  id: '1',
  name: 'Sunday Service Reminder',
  type: 'sms',
  status: 'completed',
  subject: '', // SMS doesn't have subject
  message: 'Don\'t forget about Sunday service at 9:30 AM! We\'re excited to see you there. 🙏',
  targetAudience: ['All Members', 'New Members'],
  scheduledDate: '2024-01-14T08:00:00Z',
  sentDate: '2024-01-14T08:00:00Z',
  createdAt: '2024-01-10T14:30:00Z',
  updatedAt: '2024-01-13T16:45:00Z',
  author: {
    name: 'Communications Team',
    email: 'communications@emcchurch.org',
    avatar: '/avatars/communications.jpg',
    role: 'Communications Team'
  },
  stats: {
    totalSent: 450,
    delivered: 445,
    opened: 320,
    clicked: 45,
    bounced: 5,
    failed: 0,
    unsubscribed: 2,
    deliveryRate: 98.9,
    openRate: 71.9,
    clickRate: 10.0,
    bounceRate: 1.1,
    unsubscribeRate: 0.4
  },
  settings: {
    trackOpens: true,
    trackClicks: true,
    allowReplies: true
  },
  cost: {
    smsSegments: 1,
    totalCost: 22.50,
    costPerMessage: 0.05
  }
};

const mockEngagementData = [
  { time: '8:00 AM', delivered: 45, opened: 32, clicked: 4 },
  { time: '8:30 AM', delivered: 78, opened: 56, clicked: 8 },
  { time: '9:00 AM', delivered: 92, opened: 68, clicked: 12 },
  { time: '9:30 AM', delivered: 67, opened: 48, clicked: 7 },
  { time: '10:00 AM', delivered: 89, opened: 62, clicked: 9 },
  { time: '10:30 AM', delivered: 74, opened: 54, clicked: 5 }
];

const mockAudienceBreakdown = [
  { group: 'All Members', sent: 400, delivered: 395, opened: 285, clicked: 38 },
  { group: 'New Members', sent: 50, delivered: 50, opened: 35, clicked: 7 }
];

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState(mockCampaign);
  const [isLoading, setIsLoading] = useState(false);
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    // In real app, fetch campaign by ID
    // fetchCampaign(params.id);
  }, [params.id]);

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

  const handleEdit = () => {
    router.push(`/dashboard/communications/campaigns/${params.id}/edit`);
  };

  const handleDeleteClick = () => {
    deleteDialog.openDialog(campaign);
  };

  const handleDelete = async (campaignToDelete: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Campaign deleted successfully');
    router.push('/dashboard/communications/campaigns');
  };

  const handleDuplicate = () => {
    toast.success('Campaign duplicated successfully');
    // In real app, this would create a copy and redirect to edit
  };

  const handleExportData = () => {
    toast.success('Analytics data exported successfully');
    // In real app, this would download a CSV/Excel file
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
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
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Send className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Campaign Details</h1>
            <p className="text-muted-foreground">View campaign performance and analytics</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteClick} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(campaign.status)} className="flex items-center gap-1">
                          {getStatusIcon(campaign.status)}
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        <Badge variant={getTypeColor(campaign.type)} className="flex items-center gap-1">
                          {getTypeIcon(campaign.type)}
                          {campaign.type.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{campaign.name}</CardTitle>
                      {campaign.subject && (
                        <CardDescription className="text-lg">{campaign.subject}</CardDescription>
                      )}
                    </div>
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src={campaign.author.avatar} />
                      <AvatarFallback>{campaign.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{campaign.author.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.author.role}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      Sent {formatRelativeTime(campaign.sentDate)}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{campaign.stats.deliveryRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.stats.delivered} of {campaign.stats.totalSent} delivered
                    </p>
                    <Progress value={campaign.stats.deliveryRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {campaign.type === 'email' ? 'Open Rate' : 'Read Rate'}
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getEngagementColor(campaign.stats.openRate)}`}>
                      {campaign.stats.openRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.stats.opened} {campaign.type === 'email' ? 'opens' : 'reads'}
                    </p>
                    <Progress value={campaign.stats.openRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getEngagementColor(campaign.stats.clickRate)}`}>
                      {campaign.stats.clickRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.stats.clicked} clicks
                    </p>
                    <Progress value={campaign.stats.clickRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {campaign.type === 'email' ? 'Bounce Rate' : 'Failure Rate'}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{campaign.stats.bounceRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {campaign.stats.bounced} {campaign.type === 'email' ? 'bounces' : 'failures'}
                    </p>
                    <Progress value={campaign.stats.bounceRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Target Audience</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      {campaign.targetAudience.map((group) => (
                        <Badge key={group} variant="outline" className="text-xs mr-1">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Sent Date</span>
                    </div>
                    <p className="text-sm pl-6">{formatDate(campaign.sentDate)}</p>
                  </div>
                  
                  {campaign.type === 'sms' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">SMS Details</span>
                      </div>
                      <div className="pl-6 space-y-1 text-sm">
                        <p>Segments: {campaign.cost.smsSegments}</p>
                        <p>Characters: {campaign.message.length}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {campaign.type === 'sms' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Messages Sent:</span>
                      <span className="font-semibold">{campaign.stats.totalSent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per Message:</span>
                      <span className="font-semibold">${campaign.cost.costPerMessage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SMS Segments:</span>
                      <span className="font-semibold">{campaign.cost.smsSegments}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Cost:</span>
                      <span className="font-bold text-lg">${campaign.cost.totalCost}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Created:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(campaign.createdAt)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(campaign.updatedAt)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Sent:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(campaign.sentDate)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Analytics
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Over Time
                </CardTitle>
                <CardDescription>Campaign performance throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEngagementData.map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{data.time}</span>
                        <span className="text-muted-foreground">
                          {data.delivered} delivered, {data.opened} opened, {data.clicked} clicked
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs">Delivered</span>
                          <Progress value={(data.delivered / 100) * 100} className="h-1 flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs">Opened</span>
                          <Progress value={(data.opened / 100) * 100} className="h-1 flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-xs">Clicked</span>
                          <Progress value={(data.clicked / 20) * 100} className="h-1 flex-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Key metrics comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sent</span>
                    <span className="font-semibold">{campaign.stats.totalSent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivered</span>
                    <span className="font-semibold text-green-600">{campaign.stats.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{campaign.type === 'email' ? 'Opened' : 'Read'}</span>
                    <span className="font-semibold text-blue-600">{campaign.stats.opened}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clicked</span>
                    <span className="font-semibold text-purple-600">{campaign.stats.clicked}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{campaign.type === 'email' ? 'Bounced' : 'Failed'}</span>
                    <span className="font-semibold text-red-600">{campaign.stats.bounced}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unsubscribed</span>
                    <span className="font-semibold text-orange-600">{campaign.stats.unsubscribed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience Breakdown</CardTitle>
              <CardDescription>Performance by audience segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAudienceBreakdown.map((audience, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{audience.group}</h4>
                      <Badge variant="outline">{audience.sent} recipients</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Delivered</p>
                        <p className="font-semibold text-green-600">
                          {audience.delivered} ({((audience.delivered / audience.sent) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{campaign.type === 'email' ? 'Opened' : 'Read'}</p>
                        <p className="font-semibold text-blue-600">
                          {audience.opened} ({((audience.opened / audience.delivered) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicked</p>
                        <p className="font-semibold text-purple-600">
                          {audience.clicked} ({((audience.clicked / audience.opened) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-semibold">
                          {((audience.opened / audience.delivered) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
              <CardDescription>The message that was sent to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/50">
                <div className="space-y-4">
                  {campaign.subject && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Subject:</h4>
                      <p className="font-semibold">{campaign.subject}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      {campaign.type === 'email' ? 'Email Content:' : 'SMS Message:'}
                    </h4>
                    <div className={`${campaign.type === 'sms' ? 'bg-white border rounded-lg p-4 max-w-sm' : ''}`}>
                      <p className={campaign.type === 'sms' ? 'text-sm' : ''}>
                        {campaign.message}
                      </p>
                    </div>
                  </div>
                  
                  {campaign.type === 'sms' && (
                    <div className="text-xs text-muted-foreground">
                      <p>Character count: {campaign.message.length}/160</p>
                      <p>SMS segments: {campaign.cost.smsSegments}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(handleDelete)}
        title="Delete Campaign"
        itemName={campaign.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}