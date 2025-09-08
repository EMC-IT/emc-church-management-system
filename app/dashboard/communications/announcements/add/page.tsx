'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
            <h1 className="text-2xl font-bold tracking-tight">Create New Announcement</h1>
            <p className="text-muted-foreground">Share important information with your congregation</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
              <CardDescription>Enter the main content for your announcement</CardDescription>
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
                  className="min-h-32"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.content.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeting & Priority</CardTitle>
              <CardDescription>Set who should see this announcement and its priority level</CardDescription>
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
              <CardDescription>Choose when to publish this announcement</CardDescription>
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
              <CardDescription>How your announcement will appear</CardDescription>
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
                <p className="text-sm text-muted-foreground mb-3">
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

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handlePublish} 
              className="w-full bg-brand-primary hover:bg-brand-primary/90" 
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  {formData.isScheduled ? 'Scheduling...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {formData.isScheduled ? 'Schedule Announcement' : 'Publish Now'}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleScheduleClick} 
              className="w-full" 
              disabled={isLoading || !isFormValid()}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule for Later
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
            
            {!isFormValid() && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Fill in required fields to enable publishing
              </p>
            )}
          </div>
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