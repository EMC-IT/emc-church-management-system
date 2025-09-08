'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Users, 
  Clock, 
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Megaphone,
  FileText,
  Smartphone,
  Eye,
  MousePointer,
  TrendingUp,
  Settings,
  Edit,
  Trash2,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Save,
  AlertCircle
} from 'lucide-react';
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
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { ScheduleDialog, useScheduleDialog } from '@/components/ui/schedule-dialog';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// Mock data for communications
const communicationStats = {
  messagesSent: 1247,
  openRate: 68.5,
  activeCampaigns: 5,
  memberReach: 450,
  deliveryRate: 98.5,
  clickRate: 12.3,
  unsubscribeRate: 0.8,
  responseRate: 15.2
};

const monthlyData = [
  { month: 'Jan', sent: 980, opened: 672, clicked: 134 },
  { month: 'Feb', sent: 1120, opened: 784, clicked: 156 },
  { month: 'Mar', sent: 1050, opened: 735, clicked: 147 },
  { month: 'Apr', sent: 1200, opened: 840, clicked: 168 },
  { month: 'May', sent: 1350, opened: 945, clicked: 189 },
  { month: 'Jun', sent: 1247, opened: 873, clicked: 175 }
];

const channelData = [
  { name: 'SMS', value: 45, color: '#2E8DB0' },
  { name: 'Email', value: 35, color: '#28ACD1' },
  { name: 'Push', value: 20, color: '#C49831' }
];

const announcements = [
  {
    id: '1',
    title: 'Sunday Service Update',
    content: 'This Sunday\'s service will start at 10:30 AM instead of 10:00 AM.',
    status: 'Published',
    targetGroup: 'All Members',
    createdAt: '2024-01-20',
    views: 342,
    engagement: 85
  },
  {
    id: '2',
    title: 'Youth Camp Registration',
    content: 'Registration for summer youth camp is now open. Limited spots available.',
    status: 'Scheduled',
    targetGroup: 'Youth Group',
    createdAt: '2024-01-19',
    views: 0,
    engagement: 0
  },
  {
    id: '3',
    title: 'Prayer Meeting Tonight',
    content: 'Join us for our weekly prayer meeting at 7 PM in the main sanctuary.',
    status: 'Published',
    targetGroup: 'Prayer Team',
    createdAt: '2024-01-18',
    views: 156,
    engagement: 42
  }
];

const newsletters = [
  {
    id: '1',
    title: 'Weekly Newsletter - January 2024',
    template: 'Weekly Update',
    status: 'Sent',
    subscribers: 450,
    openRate: 72.5,
    clickRate: 15.8,
    sentAt: '2024-01-15 09:00 AM'
  },
  {
    id: '2',
    title: 'Monthly Ministry Report',
    template: 'Ministry Update',
    status: 'Draft',
    subscribers: 380,
    openRate: 0,
    clickRate: 0,
    sentAt: null
  }
];

const campaigns = [
  {
    id: '1',
    name: 'Easter Service Invitation',
    type: 'Email',
    status: 'Active',
    recipients: 450,
    sent: 450,
    delivered: 445,
    opened: 312,
    clicked: 67,
    startDate: '2024-01-15',
    endDate: '2024-04-01'
  },
  {
    id: '2',
    name: 'Weekly Service Reminder',
    type: 'SMS',
    status: 'Active',
    recipients: 380,
    sent: 380,
    delivered: 375,
    opened: 0,
    clicked: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
];

const recentActivity = [
  { id: '1', action: 'Newsletter sent', target: 'All Members', time: '2 hours ago', type: 'email' },
  { id: '2', action: 'SMS campaign created', target: 'Youth Group', time: '4 hours ago', type: 'sms' },
  { id: '3', action: 'Announcement published', target: 'Prayer Team', time: '6 hours ago', type: 'announcement' },
  { id: '4', action: 'Template updated', target: 'Welcome Message', time: '1 day ago', type: 'template' }
];

const templates = [
  { 
    id: '1', 
    name: 'Welcome Message', 
    type: 'SMS', 
    category: 'Onboarding',
    content: 'Welcome to our church family! We\'re excited to have you join us.',
    usage: 45,
    lastUsed: '2024-01-18'
  },
  { 
    id: '2', 
    name: 'Service Reminder', 
    type: 'SMS', 
    category: 'Reminders',
    content: 'Don\'t forget about today\'s service at {time}. See you there!',
    usage: 120,
    lastUsed: '2024-01-20'
  },
  { 
    id: '3', 
    name: 'Birthday Wishes', 
    type: 'Email', 
    category: 'Personal',
    content: 'Happy Birthday {name}! May God bless you on your special day.',
    usage: 28,
    lastUsed: '2024-01-19'
  },
  { 
    id: '4', 
    name: 'Weekly Newsletter', 
    type: 'Email', 
    category: 'Newsletter',
    content: 'This week at church...',
    usage: 52,
    lastUsed: '2024-01-15'
  }
];

export default function CommunicationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Delete dialog hooks
  const announcementDeleteDialog = useDeleteDialog();
  const newsletterDeleteDialog = useDeleteDialog();
  const campaignDeleteDialog = useDeleteDialog();
  
  // Schedule dialog state
  const scheduleDialog = useScheduleDialog();
  
  // Newsletter send dialog state
  const [newsletterSendDialog, setNewsletterSendDialog] = useState({ isOpen: false, newsletter: null });
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  
  const handleSendNewsletter = (newsletter: any) => {
    setNewsletterSendDialog({ isOpen: true, newsletter });
  };
  
  const confirmSendNewsletter = async () => {
    if (!newsletterSendDialog.newsletter) return;
    
    setIsSendingNewsletter(true);
    try {
      // Simulate API call to send newsletter
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Newsletter "${newsletterSendDialog.newsletter.title}" sent successfully!`);
      setNewsletterSendDialog({ isOpen: false, newsletter: null });
      
    } catch (error) {
      toast.error('Failed to send newsletter. Please try again.');
    } finally {
      setIsSendingNewsletter(false);
    }
  };
  
  // Message form state
  const [messageForm, setMessageForm] = useState({
    type: '',
    recipients: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Form validation
  const isFormValid = () => {
    if (!messageForm.type || !messageForm.recipients || !messageForm.message.trim()) {
      return false;
    }
    if (messageForm.type === 'email' && !messageForm.subject.trim()) {
      return false;
    }
    if (messageForm.message.length > 500) {
      return false;
    }
    return true;
  };
  
  // Message handlers
  const handleSendNow = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${messageForm.type.toUpperCase()} message sent successfully!`);
      
      // Reset form
      setMessageForm({
        type: '',
        recipients: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!messageForm.message.trim()) {
      toast.error('Please enter a message to save as draft');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message saved as draft');
    } catch (error) {
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleMessage = async (scheduleData: any) => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const scheduledTime = new Date(scheduleData.date + 'T' + scheduleData.time);
      toast.success(`Message scheduled for ${scheduledTime.toLocaleString()}`);
      
      // Reset form
      setMessageForm({
        type: '',
        recipients: '',
        subject: '',
        message: '',
      });
      
      scheduleDialog.closeDialog();
    } catch (error) {
      toast.error('Failed to schedule message. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'published':
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      case 'failed':
      case 'paused': return 'destructive';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'sms': return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'announcement': return <Megaphone className="h-4 w-4 text-orange-600" />;
      case 'template': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">Manage all church communications and engagement</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button 
            className="bg-brand-primary hover:bg-brand-primary/90"
            onClick={() => router.push('/dashboard/communications/campaigns/add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.messagesSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-primary">{communicationStats.openRate}%</div>
                <p className="text-xs text-muted-foreground">Average open rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">Running campaigns</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Reach</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.memberReach}</div>
                <p className="text-xs text-muted-foreground">Active subscribers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-brand-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-success">{communicationStats.deliveryRate}%</div>
                <p className="text-xs text-muted-foreground">Success rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.clickRate}%</div>
                <p className="text-xs text-muted-foreground">Click-through rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.responseRate}%</div>
                <p className="text-xs text-muted-foreground">Member responses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communicationStats.unsubscribeRate}%</div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common communication tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/communications/announcements/add')}
                >
                  <Megaphone className="h-6 w-6" />
                  <span>Send Announcement</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/communications/newsletters/add')}
                >
                  <FileText className="h-6 w-6" />
                  <span>Create Newsletter</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/communications/campaigns/add')}
                >
                  <Smartphone className="h-6 w-6" />
                  <span>New SMS Campaign</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts and Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Communication Trends</CardTitle>
                <CardDescription>Monthly communication metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sent" stroke="#2E8DB0" strokeWidth={2} name="Sent" />
                    <Line type="monotone" dataKey="opened" stroke="#28ACD1" strokeWidth={2} name="Opened" />
                    <Line type="monotone" dataKey="clicked" stroke="#C49831" strokeWidth={2} name="Clicked" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest communication activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.target}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Announcements</h2>
              <p className="text-muted-foreground">Manage church announcements and notices</p>
            </div>
            <Button 
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={() => router.push('/dashboard/communications/announcements/add')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Announcements</CardTitle>
                  <CardDescription>View and manage church announcements</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{announcement.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {announcement.content}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{announcement.targetGroup}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(announcement.status)}>
                          {announcement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{announcement.createdAt}</TableCell>
                      <TableCell>{announcement.views}</TableCell>
                      <TableCell>{announcement.engagement}%</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/dashboard/communications/announcements/${announcement.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => announcementDeleteDialog.openDialog(announcement)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletters" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Newsletters</h2>
              <p className="text-muted-foreground">Create and manage email newsletters</p>
            </div>
            <Button 
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={() => router.push('/dashboard/communications/newsletters/add')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Newsletter
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                    <Badge variant={getStatusColor(newsletter.status)}>
                      {newsletter.status}
                    </Badge>
                  </div>
                  <CardDescription>Template: {newsletter.template}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subscribers:</span>
                      <span className="font-medium">{newsletter.subscribers}</span>
                    </div>
                    {newsletter.status === 'Sent' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Open Rate:</span>
                          <span className="font-medium text-brand-primary">{newsletter.openRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Click Rate:</span>
                          <span className="font-medium">{newsletter.clickRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sent At:</span>
                          <span className="font-medium">{newsletter.sentAt}</span>
                        </div>
                      </>
                    )}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/communications/newsletters/${newsletter.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {newsletter.status === 'Draft' && (
                        <Button 
                          size="sm" 
                          className="bg-brand-primary hover:bg-brand-primary/90"
                          onClick={() => handleSendNewsletter(newsletter)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </Button>
                      )}
                      <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => newsletterDeleteDialog.openDialog(newsletter)}
                       >
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">SMS & Email Campaigns</h2>
              <p className="text-muted-foreground">Manage automated communication campaigns</p>
            </div>
            <Button 
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={() => router.push('/dashboard/communications/campaigns/add')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Clicked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {campaign.type === 'Email' ? <Mail className="mr-1 h-3 w-3" /> : <Smartphone className="mr-1 h-3 w-3" />}
                          {campaign.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.recipients}</TableCell>
                      <TableCell>{campaign.delivered} / {campaign.sent}</TableCell>
                      <TableCell>{campaign.type === 'Email' ? campaign.opened : '-'}</TableCell>
                      <TableCell>{campaign.type === 'Email' ? campaign.clicked : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/dashboard/communications/campaigns/${campaign.id}/edit`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/dashboard/communications/campaigns/${campaign.id}`)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Member Messaging</h2>
              <p className="text-muted-foreground">Direct communication with church members</p>
            </div>
            <Button 
              className="bg-brand-primary hover:bg-brand-primary/90"
              onClick={() => router.push('/dashboard/communications/messages/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Quick message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 3).map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{template.name}</span>
                        <Badge variant="outline" className="text-xs">{template.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{template.content.substring(0, 50)}...</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>Send a message to members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Message Type *</label>
                    <Select value={messageForm.type} onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Recipients *</label>
                    <Select value={messageForm.recipients} onValueChange={(value) => setMessageForm(prev => ({ ...prev, recipients: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="active">Active Members</SelectItem>
                        <SelectItem value="youth">Youth Group</SelectItem>
                        <SelectItem value="leaders">Church Leaders</SelectItem>
                        <SelectItem value="prayer">Prayer Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {messageForm.type === 'email' && (
                  <div>
                    <label className="text-sm font-medium">Subject *</label>
                    <Input 
                      placeholder="Enter email subject" 
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea 
                    placeholder="Type your message here..."
                    rows={6}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {messageForm.message.length}/500 characters
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button 
                    className="bg-brand-primary hover:bg-brand-primary/90"
                    onClick={handleSendNow}
                    disabled={isLoading || !isFormValid()}
                  >
                    {isLoading ? (
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
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => scheduleDialog.openDialog()}
                    disabled={isLoading || !isFormValid()}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Communication Analytics</h2>
            <p className="text-muted-foreground">Detailed insights into communication performance</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Communication Channels</CardTitle>
                <CardDescription>Usage by communication type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {channelData.map((entry) => (
                    <div key={entry.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Communication metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sent" fill="#2E8DB0" name="Sent" />
                    <Bar dataKey="opened" fill="#28ACD1" name="Opened" />
                    <Bar dataKey="clicked" fill="#C49831" name="Clicked" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>Most used message templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.type}</Badge>
                      </TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.usage}</TableCell>
                      <TableCell>{template.lastUsed}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-brand-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(template.usage / 2, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(template.usage / 2)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialogs */}
      <DeleteDialog
        isOpen={announcementDeleteDialog.isOpen}
        onOpenChange={announcementDeleteDialog.closeDialog}
        onConfirm={() => announcementDeleteDialog.handleConfirm(async (announcement) => {
          // Add actual delete logic here
          console.log('Deleting announcement:', announcement.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Announcement"
        itemName={announcementDeleteDialog.itemToDelete?.title}
        loading={announcementDeleteDialog.loading}
      />

      <DeleteDialog
        isOpen={newsletterDeleteDialog.isOpen}
        onOpenChange={newsletterDeleteDialog.closeDialog}
        onConfirm={() => newsletterDeleteDialog.handleConfirm(async (newsletter) => {
          // Add actual delete logic here
          console.log('Deleting newsletter:', newsletter.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Newsletter"
        itemName={newsletterDeleteDialog.itemToDelete?.title}
        loading={newsletterDeleteDialog.loading}
      />

      <DeleteDialog
        isOpen={campaignDeleteDialog.isOpen}
        onOpenChange={campaignDeleteDialog.closeDialog}
        onConfirm={() => campaignDeleteDialog.handleConfirm(async (campaign) => {
          // Add actual delete logic here
          console.log('Deleting campaign:', campaign.id);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        })}
        title="Delete Campaign"
        itemName={campaignDeleteDialog.itemToDelete?.name}
        loading={campaignDeleteDialog.loading}
      />
      
      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={scheduleDialog.isOpen}
        onOpenChange={scheduleDialog.closeDialog}
        onConfirm={handleScheduleMessage}
        title="Schedule Message"
        description="Choose when to send your message"
      />
      
      {/* Newsletter Send Confirmation Dialog */}
      <AlertDialog open={newsletterSendDialog.isOpen} onOpenChange={(open) => !open && setNewsletterSendDialog({ isOpen: false, newsletter: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-brand-primary" />
              Send Newsletter Now?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to send <strong>"{newsletterSendDialog.newsletter?.title}"</strong> now?
              </p>
              <p className="text-sm text-muted-foreground">
                This newsletter will be sent to <strong>{newsletterSendDialog.newsletter?.subscribers}</strong> subscribers immediately.
              </p>
              <p className="text-sm text-yellow-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingNewsletter}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendNewsletter}
              disabled={isSendingNewsletter}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {isSendingNewsletter ? (
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