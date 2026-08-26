'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleDialog, useScheduleDialog } from '@/components/ui/schedule-dialog';

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

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const scheduleDialog = useScheduleDialog();
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
    expiryDate: ''
  });

  const handleInputChange = (field: keyof AnnouncementFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form validation
  const isFormValid = () => {
    return formData.title.trim() && formData.content.trim() && formData.targetAudience;
  };
  
  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error('Please enter at least a title or content to save as draft');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Announcement saved as draft');
      router.push('/dashboard/communications/announcements');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields (title, content, and target audience)');
      return;
    }
    
    if (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast.error('Please set a scheduled date and time');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.isScheduled) {
        const scheduledDateTime = new Date(formData.scheduledDate + 'T' + formData.scheduledTime);
        toast.success(`Announcement scheduled for ${scheduledDateTime.toLocaleString()}`);
      } else {
        toast.success('Announcement published successfully');
      }
      
      router.push('/dashboard/communications/announcements');
    } catch (error) {
      toast.error('Failed to publish announcement');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleAnnouncement = async (scheduleData: any) => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before scheduling');
      return;
    }
    
    try {
      // Update form data with schedule info
      setFormData(prev => ({
        ...prev,
        isScheduled: true,
        scheduledDate: scheduleData.date,
        scheduledTime: scheduleData.time
      }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const scheduledTime = new Date(scheduleData.date + 'T' + scheduleData.time);
      toast.success(`Announcement scheduled for ${scheduledTime.toLocaleString()}`);
      
      scheduleDialog.closeDialog();
      router.push('/dashboard/communications/announcements');
    } catch (error) {
      toast.error('Failed to schedule announcement');
    }
  };
  
  const handleScheduleClick = () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before scheduling');
      return;
    }
    scheduleDialog.openDialog();
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/communications/announcements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Create New Announcement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast church bulletins, event notices, service reminders, and ministry updates.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Announcement Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Specify title, targeted congregation group, priority, and content</p>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Special Easter Service Schedule, Annual General Meeting"
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
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
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
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6 space-y-2">
                    <Label htmlFor="scheduledTime">Scheduled Time *</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="col-span-12 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Announcement Content *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.content.length}/500 characters
                  </span>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Options Card */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Distribution & Engagement</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Configure push alerts and congregation interaction preferences</p>
            </div>

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
            onClick={() => router.push('/dashboard/communications/announcements')}
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
            onClick={handlePublish} 
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <>
                <Clock className="mr-1.5 h-4 w-4 animate-spin" />
                <span>{formData.isScheduled ? 'Scheduling...' : 'Publishing...'}</span>
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-4 w-4" />
                <span>{formData.isScheduled ? 'Schedule Announcement' : 'Publish Now'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={scheduleDialog.isOpen}
        onOpenChange={scheduleDialog.closeDialog}
        onConfirm={handleScheduleAnnouncement}
        title="Schedule Announcement"
        description="Choose when to publish this announcement"
      />
    </div>
  );
}