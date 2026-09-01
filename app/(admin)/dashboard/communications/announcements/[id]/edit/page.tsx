'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
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
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
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
      case 'high': return 'danger';
      case 'medium': return 'primary';
      case 'low': return 'neutral';
      default: return 'primary';
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
      case 'published': return 'primary';
      case 'scheduled': return 'neutral';
      case 'draft': return 'neutral';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/communications/announcements/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Announcement</h1>
          </div>
        </div>
        <Badge variant={getStatusColor(formData.status)} className="w-fit text-xs self-start sm:self-auto">
          Status: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Announcement Details</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="audience">Target Audience *</Label>
                <Select value={formData.targetAudience} onValueChange={(value) => handleInputChange('targetAudience', value)}>
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudiences.map((audience) => (
                      <SelectItem key={audience} value={audience}>
                        {audience}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <DatePicker
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(_, dateStr) => handleInputChange('expiryDate', dateStr)}
                  placeholder="Select expiry date"
                  clearable
                />
              </div>

              <div className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                <div className="space-y-0.5">
                  <Label htmlFor="scheduled" className="text-sm font-medium cursor-pointer">Schedule for Later</Label>
                  <p className="text-xs text-muted-foreground">Publish at future date/time</p>
                </div>
                <Switch
                  id="scheduled"
                  checked={formData.isScheduled}
                  onCheckedChange={(checked) => handleInputChange('isScheduled', checked)}
                />
              </div>

              {formData.isScheduled && (
                <>
                  <div className="col-span-12 sm:col-span-6 space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                    <DatePicker
                      id="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={(_, dateStr) => handleInputChange('scheduledDate', dateStr)}
                      minDate={new Date()}
                      placeholder="Select publish date"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6 space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                    <TimePicker
                      id="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={(timeStr) => handleInputChange('scheduledTime', timeStr)}
                      placeholder="Select publish time"
                    />
                  </div>
                </>
              )}

              <div className="col-span-12 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Announcement Content *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.content.length}/1000 characters
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Announcement details, date, location, and relevant instructions..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Options Card */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Distribution & Engagement</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 flex items-center justify-between rounded-lg border border-border p-3.5">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">Broadcast Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify members via mobile push and email</p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.sendNotification}
                  onCheckedChange={(checked) => handleInputChange('sendNotification', checked)}
                />
              </div>
              
              <div className="col-span-12 sm:col-span-6 flex items-center justify-between rounded-lg border border-border p-3.5">
                <div className="space-y-0.5">
                  <Label htmlFor="comments" className="text-sm font-medium cursor-pointer">Allow Member Comments</Label>
                  <p className="text-xs text-muted-foreground">Let members reply and react to announcement</p>
                </div>
                <Switch
                  id="comments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/communications/announcements/${params.id}`)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isLoading}
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save as Draft
          </Button>
          
          <Button 
            onClick={handleUpdate} 
            disabled={isLoading}
          >
            <Send className="mr-1.5 h-4 w-4" />
            {formData.isScheduled ? 'Update & Schedule' : 'Save & Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
}