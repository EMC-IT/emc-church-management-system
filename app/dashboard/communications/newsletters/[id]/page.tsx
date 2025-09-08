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
  FileText,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Users,
  Eye,
  Mail,
  MousePointer,
  TrendingUp,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  BarChart3
} from 'lucide-react';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';

// Mock data - in real app, this would come from API
const mockNewsletter = {
  id: '1',
  title: 'Weekly Church Update - January 2024',
  subject: 'This Week at EMC Church',
  status: 'sent',
  template: 'Weekly Update',
  content: `
    <h2>Pastor's Message</h2>
    <p>Dear Church Family,</p>
    <p>As we begin this new week, I want to remind you of God's faithfulness and love. This Sunday, we'll be continuing our series on "Faith in Action" with a powerful message about living out our beliefs in our daily lives.</p>
    
    <h2>Upcoming Events</h2>
    <ul>
      <li><strong>Sunday Service</strong> - January 21st at 9:30 AM</li>
      <li><strong>Bible Study</strong> - Wednesday at 7:00 PM</li>
      <li><strong>Youth Group</strong> - Friday at 7:00 PM</li>
      <li><strong>Community Outreach</strong> - Saturday at 10:00 AM</li>
    </ul>
    
    <h2>Prayer Requests</h2>
    <p>Please keep the Johnson family in your prayers as they navigate through a difficult time. Also, pray for our upcoming mission trip to Guatemala.</p>
    
    <h2>Announcements</h2>
    <p>Don't forget to sign up for the church picnic happening on February 3rd. We're expecting a great turnout and wonderful fellowship!</p>
    
    <p>Blessings,<br/>Pastor John</p>
  `,
  previewText: 'Join us this Sunday for worship at 9:30 AM. Pastor John will be continuing our series on "Faith in Action"...',
  scheduledDate: '2024-01-15T08:00:00Z',
  sentDate: '2024-01-15T08:00:00Z',
  createdAt: '2024-01-10T14:30:00Z',
  updatedAt: '2024-01-14T10:30:00Z',
  author: {
    name: 'Communications Team',
    email: 'communications@emcchurch.org',
    avatar: '/avatars/communications.jpg',
    role: 'Communications Team'
  },
  stats: {
    totalSent: 450,
    delivered: 445,
    opened: 350,
    clicked: 54,
    bounced: 5,
    unsubscribed: 2,
    openRate: 78.7,
    clickRate: 12.1,
    deliveryRate: 98.9,
    bounceRate: 1.1
  },
  subscriberGroups: ['All Subscribers', 'Church Members'],
  settings: {
    allowForwarding: true,
    trackOpens: true,
    trackClicks: true
  }
};

const mockEngagementData = [
  { time: '8:00 AM', opens: 45, clicks: 8 },
  { time: '9:00 AM', opens: 78, clicks: 12 },
  { time: '10:00 AM', opens: 92, clicks: 15 },
  { time: '11:00 AM', opens: 67, clicks: 9 },
  { time: '12:00 PM', opens: 34, clicks: 4 },
  { time: '1:00 PM', opens: 23, clicks: 2 },
  { time: '2:00 PM', opens: 11, clicks: 1 }
];

export default function NewsletterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [newsletter, setNewsletter] = useState(mockNewsletter);
  const [isLoading, setIsLoading] = useState(false);
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    // In real app, fetch newsletter by ID
    // fetchNewsletter(params.id);
  }, [params.id]);

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

  const handleEdit = () => {
    router.push(`/dashboard/communications/newsletters/${params.id}/edit`);
  };

  const handleDeleteClick = () => {
    deleteDialog.openDialog(newsletter);
  };

  const handleDelete = async (newsletterToDelete: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Newsletter deleted successfully');
    router.push('/dashboard/communications/newsletters');
  };

  const handleDuplicate = () => {
    toast.success('Newsletter duplicated successfully');
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
            <FileText className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Newsletter Details</h1>
            <p className="text-muted-foreground">View newsletter content and analytics</p>
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
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
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
                        <Badge variant={getStatusColor(newsletter.status)} className="flex items-center gap-1">
                          {getStatusIcon(newsletter.status)}
                          {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">{newsletter.template}</Badge>
                      </div>
                      <CardTitle className="text-2xl">{newsletter.title}</CardTitle>
                      <CardDescription className="text-lg">{newsletter.subject}</CardDescription>
                    </div>
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar>
                      <AvatarImage src={newsletter.author.avatar} />
                      <AvatarFallback>{newsletter.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{newsletter.author.name}</p>
                      <p className="text-sm text-muted-foreground">{newsletter.author.role}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      Sent {formatRelativeTime(newsletter.sentDate)}
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
                    <div className="text-2xl font-bold text-green-600">{newsletter.stats.deliveryRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {newsletter.stats.delivered} of {newsletter.stats.totalSent} delivered
                    </p>
                    <Progress value={newsletter.stats.deliveryRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getEngagementColor(newsletter.stats.openRate)}`}>
                      {newsletter.stats.openRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {newsletter.stats.opened} opens
                    </p>
                    <Progress value={newsletter.stats.openRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getEngagementColor(newsletter.stats.clickRate)}`}>
                      {newsletter.stats.clickRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {newsletter.stats.clicked} clicks
                    </p>
                    <Progress value={newsletter.stats.clickRate} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{newsletter.stats.bounceRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {newsletter.stats.bounced} bounces
                    </p>
                    <Progress value={newsletter.stats.bounceRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Subscriber Groups</span>
                    </div>
                    <div className="pl-6 space-y-1">
                      {newsletter.subscriberGroups.map((group) => (
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
                    <p className="text-sm pl-6">{formatDate(newsletter.sentDate)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Preview Text</span>
                    </div>
                    <p className="text-sm pl-6 text-muted-foreground">{newsletter.previewText}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Created:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(newsletter.createdAt)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Last Updated:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(newsletter.updatedAt)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Sent:</span>
                    <br />
                    <span className="text-muted-foreground">{formatDate(newsletter.sentDate)}</span>
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
                    Share Newsletter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Content</CardTitle>
              <CardDescription>The content that was sent to subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white max-w-4xl">
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">{newsletter.title}</h1>
                    <p className="text-muted-foreground">{newsletter.previewText}</p>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: newsletter.content }}
                  />
                  
                  <div className="text-center border-t pt-4 text-sm text-muted-foreground">
                    <p>© 2024 EMC Church. All rights reserved.</p>
                    <p>You received this email because you subscribed to our newsletter.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <CardDescription>Opens and clicks throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEngagementData.map((data, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm">{data.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Opens: {data.opens}</span>
                        </div>
                        <Progress value={(data.opens / 100) * 100} className="h-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Clicks: {data.clicks}</span>
                        </div>
                        <Progress value={(data.clicks / 20) * 100} className="h-2" />
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
                    <span className="font-semibold">{newsletter.stats.totalSent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivered</span>
                    <span className="font-semibold text-green-600">{newsletter.stats.delivered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Opened</span>
                    <span className="font-semibold text-blue-600">{newsletter.stats.opened}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clicked</span>
                    <span className="font-semibold text-purple-600">{newsletter.stats.clicked}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounced</span>
                    <span className="font-semibold text-red-600">{newsletter.stats.bounced}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unsubscribed</span>
                    <span className="font-semibold text-orange-600">{newsletter.stats.unsubscribed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Information</CardTitle>
              <CardDescription>Details about who received this newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{newsletter.stats.totalSent}</div>
                  <p className="text-sm text-muted-foreground">Total Recipients</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{newsletter.stats.delivered}</div>
                  <p className="text-sm text-muted-foreground">Successfully Delivered</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{newsletter.stats.bounced}</div>
                  <p className="text-sm text-muted-foreground">Bounced Emails</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Subscriber Groups</h4>
                <div className="space-y-2">
                  {newsletter.subscriberGroups.map((group) => (
                    <div key={group} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{group}</span>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
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
        title="Delete Newsletter"
        itemName={newsletter.title}
        loading={deleteDialog.loading}
      />
    </div>
  );
}