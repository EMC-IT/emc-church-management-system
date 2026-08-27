'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Calendar,
  Megaphone,
  FileText,
  Smartphone,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Activity,
  Save,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { ScheduleDialog, useScheduleDialog } from '@/components/ui/schedule-dialog';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

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
  { name: 'SMS', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Email', value: 35, color: 'hsl(var(--chart-2))' },
  { name: 'Push Notifications', value: 20, color: 'hsl(var(--chart-3))' }
];

const announcements = [
  {
    id: '1',
    title: 'Sunday Service Update',
    content: 'This Sunday\'s service will start at 10:30 AM instead of 10:00 AM.',
    status: 'published',
    targetGroup: 'All Members',
    createdAt: '2024-01-20',
    views: 342,
    engagement: 85
  },
  {
    id: '2',
    title: 'Youth Camp Registration',
    content: 'Registration for summer youth camp is now open. Limited spots available.',
    status: 'scheduled',
    targetGroup: 'Youth Group',
    createdAt: '2024-01-19',
    views: 0,
    engagement: 0
  },
  {
    id: '3',
    title: 'Prayer Meeting Tonight',
    content: 'Join us for our weekly prayer meeting at 7 PM in the main sanctuary.',
    status: 'published',
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
    status: 'sent',
    subscribers: 450,
    openRate: 72.5,
    clickRate: 15.8,
    sentAt: '2024-01-15 09:00 AM'
  },
  {
    id: '2',
    title: 'Monthly Ministry Report',
    template: 'Ministry Update',
    status: 'draft',
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
    status: 'active',
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
    status: 'active',
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

// Chart configurations
const monthlyStatsConfig = {
  sent: { label: 'Sent', color: 'hsl(var(--chart-1))' },
  opened: { label: 'Opened', color: 'hsl(var(--chart-2))' },
  clicked: { label: 'Clicked', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

const channelDistributionConfig = {
  value: { label: 'Messages', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

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
  const [newsletterSendDialog, setNewsletterSendDialog] = useState<{ isOpen: boolean; newsletter: any | null }>({ isOpen: false, newsletter: null });
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  
  const handleSendNewsletter = (newsletter: any) => {
    setNewsletterSendDialog({ isOpen: true, newsletter });
  };
  
  const confirmSendNewsletter = async () => {
    if (!newsletterSendDialog.newsletter) return;
    
    setIsSendingNewsletter(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Newsletter "${newsletterSendDialog.newsletter.title}" sent successfully!`);
      setNewsletterSendDialog({ isOpen: false, newsletter: null });
    } catch {
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
  
  const isFormValid = () => {
    if (!messageForm.type || !messageForm.recipients || !messageForm.message.trim()) {
      return false;
    }
    if (messageForm.type === 'email' && !messageForm.subject.trim()) {
      return false;
    }
    return messageForm.message.length <= 500;
  };
  
  const handleSendNow = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${messageForm.type.toUpperCase()} message sent successfully!`);
      setMessageForm({
        type: '',
        recipients: '',
        subject: '',
        message: '',
      });
    } catch {
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
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Message saved as draft');
    } catch {
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-primary" />;
      case 'sms': return <Smartphone className="h-4 w-4 text-secondary" />;
      case 'announcement': return <Megaphone className="h-4 w-4 text-accent" />;
      case 'template': return <FileText className="h-4 w-4 text-muted-foreground" />;
      default: return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Communications"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/communications/announcements">
                    <Megaphone className="mr-2 h-4 w-4" />
                    Announcements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/communications/newsletters">
                    <FileText className="mr-2 h-4 w-4" />
                    Newsletters
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/communications/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Member Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.success('Communications report exported')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild>
              <Link href="/dashboard/communications/campaigns/add">
                <Plus className="mr-1.5 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* 4 High-Signal Key Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Messages Sent"
              value={communicationStats.messagesSent.toLocaleString()}
              icon={MessageSquare}
              accent="primary"
            />
            <StatCard
              title="Delivery Rate"
              value={`${communicationStats.deliveryRate}%`}
              icon={CheckCircle}
              accent="success"
            />
            <StatCard
              title="Active Campaigns"
              value={communicationStats.activeCampaigns}
              icon={Activity}
              accent="accent"
            />
            <StatCard
              title="Member Reach"
              value={communicationStats.memberReach}
              icon={Users}
              accent="secondary"
            />
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Communication Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyStatsConfig} className="h-72 w-full">
                  <LineChart data={monthlyData} margin={{ left: 12, right: 12, top: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="line" />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="sent" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opened" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicked" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-3))' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2.5 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
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

        {/* ANNOUNCEMENTS TAB */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold">Announcements</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9 w-60"
                    />
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/communications/announcements/add">
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Announcement
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target Group</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{announcement.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {announcement.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">{announcement.targetGroup}</TableCell>
                        <TableCell>
                          <StatusBadge status={announcement.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{announcement.createdAt}</TableCell>
                        <TableCell className="text-sm">{announcement.views}</TableCell>
                        <TableCell className="text-sm">{announcement.engagement}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/dashboard/communications/announcements/${announcement.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive"
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEWSLETTERS TAB */}
        <TabsContent value="newsletters" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Newsletters</h3>
            <Button size="sm" asChild>
              <Link href="/dashboard/communications/newsletters/add">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Newsletter
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{newsletter.title}</CardTitle>
                    <StatusBadge status={newsletter.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">Template: {newsletter.template}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers:</span>
                      <span className="font-medium text-foreground">{newsletter.subscribers}</span>
                    </div>
                    {newsletter.status === 'sent' && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Open Rate:</span>
                          <span className="font-medium text-foreground">{newsletter.openRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Click Rate:</span>
                          <span className="font-medium text-foreground">{newsletter.clickRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sent At:</span>
                          <span className="font-medium text-foreground">{newsletter.sentAt}</span>
                        </div>
                      </>
                    )}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/dashboard/communications/newsletters/${newsletter.id}/edit`}>
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      {newsletter.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSendNewsletter(newsletter)}
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Send
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => newsletterDeleteDialog.openDialog(newsletter)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Communication Campaigns</CardTitle>
                <Button size="sm" asChild>
                  <Link href="/dashboard/communications/campaigns/add">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Campaign
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Clicked</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="neutral">
                            {campaign.type === 'Email' ? <Mail className="mr-1 h-3 w-3" /> : <Smartphone className="mr-1 h-3 w-3" />}
                            {campaign.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell>{campaign.recipients}</TableCell>
                        <TableCell>{campaign.delivered} / {campaign.sent}</TableCell>
                        <TableCell>{campaign.type === 'Email' ? campaign.opened : '-'}</TableCell>
                        <TableCell>{campaign.type === 'Email' ? campaign.clicked : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/dashboard/communications/campaigns/${campaign.id}/edit`}>
                                <Settings className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/dashboard/communications/campaigns/${campaign.id}`}>
                                <BarChart3 className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MESSAGING TAB */}
        <TabsContent value="messaging" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Message Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templates.slice(0, 3).map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{template.name}</span>
                        <Badge variant="neutral" className="text-xs">{template.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.content.substring(0, 60)}...</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Compose Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">Message Type *</label>
                    <Select value={messageForm.type} onValueChange={(value) => setMessageForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1.5">
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
                    <label className="text-sm font-medium text-foreground">Recipients *</label>
                    <Select value={messageForm.recipients} onValueChange={(value) => setMessageForm(prev => ({ ...prev, recipients: value }))}>
                      <SelectTrigger className="mt-1.5">
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
                    <label className="text-sm font-medium text-foreground">Subject *</label>
                    <Input 
                      placeholder="Enter email subject" 
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-foreground">Message *</label>
                  <Textarea 
                    placeholder="Type your message here..."
                    rows={5}
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {messageForm.message.length}/500 characters
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 pt-2">
                  <Button 
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

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Channel Delivery Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((ch, idx) => (
                    <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">{ch.name}</div>
                      <Badge variant="neutral">{ch.value}% share</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Engagement Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <span className="text-muted-foreground">Average Open Rate</span>
                  <span className="font-bold text-foreground">68.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <span className="text-muted-foreground">Average Click Through Rate</span>
                  <span className="font-bold text-foreground">12.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-bold text-foreground">15.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <span className="text-muted-foreground">Unsubscribe Rate</span>
                  <span className="font-bold text-muted-foreground">0.8%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Dialogs */}
      <DeleteDialog
        isOpen={announcementDeleteDialog.isOpen}
        onOpenChange={announcementDeleteDialog.closeDialog}
        onConfirm={() => {
          toast.success('Announcement deleted');
          announcementDeleteDialog.closeDialog();
        }}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement?"
        itemName={announcementDeleteDialog.itemToDelete?.title}
      />

      <DeleteDialog
        isOpen={newsletterDeleteDialog.isOpen}
        onOpenChange={newsletterDeleteDialog.closeDialog}
        onConfirm={() => {
          toast.success('Newsletter deleted');
          newsletterDeleteDialog.closeDialog();
        }}
        title="Delete Newsletter"
        description="Are you sure you want to delete this newsletter draft?"
        itemName={newsletterDeleteDialog.itemToDelete?.title}
      />
    </div>
  );
}