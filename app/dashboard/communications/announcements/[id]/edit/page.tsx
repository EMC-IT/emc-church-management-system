'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Megaphone,
  Save,
  Send,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Eye,
  History
} from 'lucide-react';
import { toast } from 'sonner';

interface AnnouncementFormData {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetAudience: string;
  scheduledDate: string;
  scheduledTime: string;
  isScheduled: boolean;
  sendNotification: boolean;
  allowComments: boolean;
  expiryDate: string;
  status: 'draft' | 'scheduled' | 'published';
}

const targetAudiences = [
  'All Members',
  'Youth Group',
  'Adult Ministry',
  'Children Ministry',
  'Prayer Group',
  'Choir Members',
  'Church Leaders',
  'Volunteers',
  'New Members',
  'Small Groups'
];

// Mock data - in real app, this would come from API
const mockAnnouncement = {
  id: '1',
  title: 'Sunday Service Update',
  content: `Dear Church Family,

We hope this message finds you well and blessed. We wanted to inform you of an important update regarding this Sunday's service schedule.

Please note that this Sunday's service will start at 10:00 AM instead of the usual 9:30 AM. This change is to accommodate our special guest speaker, Pastor Michael Thompson, who will be sharing a powerful message about "Walking in Faith During Challenging Times."

We encourage everyone to arrive a few minutes early to fellowship and prepare our hearts for worship. Coffee and light refreshments will be available in the fellowship hall starting at 9:30 AM.

We look forward to seeing you all there for what promises to be a blessed and inspiring service.

God bless,
Pastor John`,
  status: 'published',
  priority: 'high',
  targetAudience: 'All Members',
  scheduledDate: '2024-01-15',
  scheduledTime: '09:00',
  isScheduled: true,
  sendNotification: true,
  allowComments: true,
  expiryDate: '2024-01-22',
  createdAt: '2024-01-10T14:30:00Z',
  updatedAt: '2024-01-14T10:30:00Z'
};

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 'medium',
    targetAudience: '',
    scheduledDate: '',
    scheduledTime: '',
    isScheduled: false,
    sendNotification: true,
    allowComments: true,
    expiryDate: '',
    status: 'draft'
  });

  useEffect(() => {
    // In real app, fetch announcement by ID
    // For now, use mock data
    setFormData({
      title: mockAnnouncement.title,
      content: mockAnnouncement.content,
      priority: mockAnnouncement.priority as 'low' | 'medium' | 'high',
      targetAudience: mockAnnouncement.targetAudience,
      scheduledDate: mockAnnouncement.scheduledDate,
      scheduledTime: mockAnnouncement.scheduledTime,
      isScheduled: mockAnnouncement.isScheduled,
      sendNotification: mockAnnouncement.sendNotification,
      allowComments: mockAnnouncement.allowComments,
      expiryDate: mockAnnouncement.expiryDate,
      status: mockAnnouncement.status as 'draft' | 'scheduled' | 'published'
    });
  }, [params.id]);

  const handleInputChange = (field: keyof AnnouncementFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Announcement updated and saved as draft');
      router.push('/dashboard/communications/announcements');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.targetAudience) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData.isScheduled) {
        toast.success('Announcement updated and scheduled successfully');
      } else {
        toast.success('Announcement updated successfully');
      }
      
      router.push(`/dashboard/communications/announcements/${params.id}`);
    } catch (error) {
      toast.error('Failed to update announcement');
    } finally {
      setIsLoading(false);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
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
            <Megaphone className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Announcement</h1>
            <p className="text-muted-foreground">Update announcement details and settings</p>
          </div>
        </div>

        {/* Current Status */}
        <Badge variant={getStatusColor(formData.status)} className="text-sm">
          Current: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>Update the main content for your announcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="min-h-40"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.content.length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeting & Priority</CardTitle>
              <CardDescription>Update who should see this announcement and its priority level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience *</Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetAudiences.map((audience) => (
                        <SelectItem key={audience} value={audience}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {audience}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          High Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling Options</CardTitle>
              <CardDescription>Update when to publish this announcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) => handleInputChange('isScheduled', checked)}
                />
                <Label htmlFor="scheduled">Schedule for later</Label>
              </div>
              
              {formData.isScheduled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Announcement will be automatically hidden after this date
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your updated announcement will appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    {formData.title || 'Announcement Title'}
                  </h3>
                  <Badge variant={getPriorityColor(formData.priority)} className="flex items-center gap-1">
                    {getPriorityIcon(formData.priority)}
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-4">
                  {formData.content || 'Your announcement content will appear here...'}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formData.targetAudience || 'Target Audience'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formData.isScheduled && formData.scheduledDate 
                      ? new Date(formData.scheduledDate).toLocaleDateString()
                      : 'Now'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Send Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify members via email/SMS</p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.sendNotification}
                  onCheckedChange={(checked) => handleInputChange('sendNotification', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comments">Allow Comments</Label>
                  <p className="text-sm text-muted-foreground">Let members respond</p>
                </div>
                <Switch
                  id="comments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(mockAnnouncement.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleUpdate} 
              className="w-full" 
              disabled={isLoading}
            >
              <Send className="mr-2 h-4 w-4" />
              {formData.isScheduled ? 'Update & Schedule' : 'Update & Publish'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveDraft} 
              className="w-full" 
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/dashboard/communications/announcements/${params.id}`)} 
              className="w-full"
            >
              Cancel Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}