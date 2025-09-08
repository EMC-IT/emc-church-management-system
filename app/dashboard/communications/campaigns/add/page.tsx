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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Send,
  Save,
  Calendar,
  Users,
  Mail,
  MessageSquare,
  Eye,
  Type,
  Settings,
  Smartphone,
  AtSign,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleDialog, useScheduleDialog } from '@/components/ui/schedule-dialog';

interface CampaignFormData {
  name: string;
  type: 'email' | 'sms' | '';
  subject: string; // Only for email
  message: string;
  targetAudience: string[];
  scheduledDate: string;
  scheduledTime: string;
  isScheduled: boolean;
  sendTestMessage: boolean;
  testContact: string;
  trackOpens: boolean;
  trackClicks: boolean;
  allowReplies: boolean;
}

const audienceGroups = [
  { id: 'all-members', name: 'All Members', count: 450, description: 'All church members' },
  { id: 'youth-group', name: 'Youth Group', count: 125, description: 'Ages 13-25' },
  { id: 'adult-ministry', name: 'Adult Ministry', count: 280, description: 'Ages 26-65' },
  { id: 'children-ministry', name: 'Children Ministry', count: 95, description: 'Ages 0-12 (parents)' },
  { id: 'prayer-group', name: 'Prayer Group', count: 85, description: 'Prayer warriors' },
  { id: 'choir-members', name: 'Choir Members', count: 45, description: 'Music ministry' },
  { id: 'volunteers', name: 'Volunteers', count: 120, description: 'Active volunteers' },
  { id: 'new-members', name: 'New Members', count: 35, description: 'Joined in last 6 months' },
  { id: 'small-groups', name: 'Small Groups', count: 180, description: 'Small group participants' },
  { id: 'church-leaders', name: 'Church Leaders', count: 25, description: 'Leadership team' }
];

const emailTemplates = [
  {
    id: 'announcement',
    name: 'Announcement',
    subject: 'Important Church Announcement',
    content: 'Dear Church Family,\n\n[Your announcement here]\n\nBlessings,\n[Your Name]'
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    subject: 'You\'re Invited to [Event Name]',
    content: 'Join us for [Event Name] on [Date] at [Time].\n\n[Event details]\n\nRSVP: [Contact Info]'
  },
  {
    id: 'reminder',
    name: 'Reminder',
    subject: 'Reminder: [Event/Service]',
    content: 'This is a friendly reminder about [Event/Service] happening [When].\n\nSee you there!'
  }
];

const smsTemplates = [
  {
    id: 'service-reminder',
    name: 'Service Reminder',
    content: 'Reminder: Sunday service at 9:30 AM. See you there! 🙏'
  },
  {
    id: 'event-alert',
    name: 'Event Alert',
    content: '[Event Name] is happening [When]. Don\'t miss it! Reply STOP to opt out.'
  },
  {
    id: 'prayer-request',
    name: 'Prayer Request',
    content: 'Please pray for [Request]. Your prayers make a difference. 🙏'
  }
];

export default function AddCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('type');
  const scheduleDialog = useScheduleDialog();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: '',
    subject: '',
    message: '',
    targetAudience: [],
    scheduledDate: '',
    scheduledTime: '',
    isScheduled: false,
    sendTestMessage: false,
    testContact: '',
    trackOpens: true,
    trackClicks: true,
    allowReplies: false
  });

  const handleInputChange = (field: keyof CampaignFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeSelect = (type: 'email' | 'sms') => {
    setFormData(prev => ({
      ...prev,
      type,
      // Reset type-specific fields
      subject: type === 'email' ? prev.subject : '',
      message: '',
      trackOpens: type === 'email',
      trackClicks: type === 'email'
    }));
    setActiveTab('content');
  };

  const handleTemplateSelect = (templateId: string) => {
    const templates = formData.type === 'email' ? emailTemplates : smsTemplates;
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: formData.type === 'email' && 'subject' in template ? (template.subject as string) : prev.subject,
        message: template.content
      }));
    }
  };

  const handleAudienceToggle = (audienceId: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audienceId)
        ? prev.targetAudience.filter(id => id !== audienceId)
        : [...prev.targetAudience, audienceId]
    }));
  };

  const getTotalRecipients = () => {
    return formData.targetAudience.reduce((total, audienceId) => {
      const group = audienceGroups.find(g => g.id === audienceId);
      return total + (group?.count || 0);
    }, 0);
  };

  const getCharacterCount = () => {
    return formData.message.length;
  };

  const getSMSSegments = () => {
    const length = getCharacterCount();
    if (length <= 160) return 1;
    return Math.ceil(length / 153);
  };

  // Form validation
  const isFormValid = () => {
    if (!formData.name.trim() || !formData.type || !formData.message.trim() || formData.targetAudience.length === 0) {
      return false;
    }
    if (formData.type === 'email' && !formData.subject.trim()) {
      return false;
    }
    return true;
  };
  
  const handleSaveDraft = async () => {
    if (!formData.name.trim() && !formData.message.trim()) {
      toast.error('Please enter at least a campaign name or message to save as draft');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Campaign saved as draft');
      router.push('/dashboard/communications/campaigns');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields and select at least one audience');
      return;
    }
    
    if (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime)) {
      toast.error('Please set a scheduled date and time');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.isScheduled) {
        const scheduledDateTime = new Date(formData.scheduledDate + 'T' + formData.scheduledTime);
        toast.success(`Campaign scheduled for ${scheduledDateTime.toLocaleString()}`);
      } else {
        toast.success('Campaign sent successfully');
      }
      
      router.push('/dashboard/communications/campaigns');
    } catch (error) {
      toast.error('Failed to send campaign');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleCampaign = async (scheduleData: any) => {
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
      toast.success(`Campaign scheduled for ${scheduledTime.toLocaleString()}`);
      
      scheduleDialog.closeDialog();
      router.push('/dashboard/communications/campaigns');
    } catch (error) {
      toast.error('Failed to schedule campaign');
    }
  };
  
  const handleScheduleClick = () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields before scheduling');
      return;
    }
    scheduleDialog.openDialog();
  };

  const handleSendTest = async () => {
    if (!formData.testContact.trim()) {
      toast.error(`Please enter a test ${formData.type === 'email' ? 'email' : 'phone number'}`);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Test ${formData.type} sent to ${formData.testContact}`);
    } catch (error) {
      toast.error('Failed to send test message');
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
            <Send className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Campaign</h1>
            <p className="text-muted-foreground">Send targeted SMS or email campaigns to your congregation</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="type" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Type
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Campaign Type Selection */}
        <TabsContent value="type" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Campaign Type</CardTitle>
              <CardDescription>Select the type of campaign you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.type === 'email' ? 'ring-2 ring-brand-primary' : ''
                  }`}
                  onClick={() => handleTypeSelect('email')}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-blue-100 rounded-full w-fit mb-4">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle>Email Campaign</CardTitle>
                    <CardDescription>Send rich HTML emails with tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Rich text formatting
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Open & click tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Images & attachments
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Detailed analytics
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.type === 'sms' ? 'ring-2 ring-brand-primary' : ''
                  }`}
                  onClick={() => handleTypeSelect('sms')}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-green-100 rounded-full w-fit mb-4">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle>SMS Campaign</CardTitle>
                    <CardDescription>Send instant text messages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Instant delivery
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        High open rates
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Mobile-first
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Cost-effective
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Creation */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {formData.type === 'email' ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    Campaign Details
                  </CardTitle>
                  <CardDescription>
                    {formData.type === 'email' ? 'Create your email campaign' : 'Create your SMS campaign'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter campaign name..."
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  {formData.type === 'email' && (
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Enter email subject..."
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {formData.type === 'email' ? 'Email Content' : 'SMS Message'} *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder={formData.type === 'email' 
                        ? 'Write your email content here...'
                        : 'Write your SMS message here...'
                      }
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={formData.type === 'email' ? 'min-h-32' : 'min-h-20'}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{getCharacterCount()} characters</span>
                      {formData.type === 'sms' && (
                        <span>{getSMSSegments()} SMS segment{getSMSSegments() > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {formData.type === 'sms' && getCharacterCount() > 160 && (
                      <p className="text-sm text-yellow-600">
                        Messages over 160 characters will be sent as multiple SMS segments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Templates</CardTitle>
                  <CardDescription>Use a template to get started quickly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(formData.type === 'email' ? emailTemplates : smsTemplates).map((template) => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer hover:shadow-sm transition-shadow"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">{template.name}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {formData.type === 'email' && 'subject' in template 
                              ? (template.subject as string) 
                              : template.content
                            }
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.type ? (
                    <div className="flex items-center gap-3">
                      {formData.type === 'email' ? (
                        <Mail className="h-8 w-8 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-8 w-8 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {formData.type === 'email' ? 'Email Campaign' : 'SMS Campaign'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formData.type === 'email' ? 'Rich HTML emails' : 'Text messages'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No type selected</p>
                  )}
                </CardContent>
              </Card>

              {formData.type === 'sms' && (
                <Card>
                  <CardHeader>
                    <CardTitle>SMS Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Characters:</span>
                      <span className="text-sm font-medium">{getCharacterCount()}/160</span>
                    </div>
                    <Progress value={(getCharacterCount() / 160) * 100} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm">SMS Segments:</span>
                      <span className="text-sm font-medium">{getSMSSegments()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Each segment costs one SMS credit
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Audience Selection */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Target Audience</CardTitle>
              <CardDescription>Choose which groups will receive this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {audienceGroups.map((group) => (
                  <Card 
                    key={group.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      formData.targetAudience.includes(group.id) ? 'ring-2 ring-brand-primary bg-brand-primary/5' : ''
                    }`}
                    onClick={() => handleAudienceToggle(group.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.targetAudience.includes(group.id) 
                              ? 'bg-brand-primary border-brand-primary' 
                              : 'border-gray-300'
                          }`}>
                            {formData.targetAudience.includes(group.id) && (
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{group.count}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {formData.targetAudience.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Selected Audience Summary</span>
                  </div>
                  <p className="text-blue-800">
                    <strong>{getTotalRecipients()}</strong> total recipients across{' '}
                    <strong>{formData.targetAudience.length}</strong> group{formData.targetAudience.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>Configure when to send your campaign</CardDescription>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Date</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking & Analytics</CardTitle>
                <CardDescription>Configure campaign tracking options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.type === 'email' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trackOpens">Track Opens</Label>
                        <p className="text-sm text-muted-foreground">Monitor email open rates</p>
                      </div>
                      <Switch
                        id="trackOpens"
                        checked={formData.trackOpens}
                        onCheckedChange={(checked) => handleInputChange('trackOpens', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trackClicks">Track Clicks</Label>
                        <p className="text-sm text-muted-foreground">Monitor link clicks</p>
                      </div>
                      <Switch
                        id="trackClicks"
                        checked={formData.trackClicks}
                        onCheckedChange={(checked) => handleInputChange('trackClicks', checked)}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowReplies">Allow Replies</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.type === 'email' ? 'Allow email replies' : 'Allow SMS replies'}
                    </p>
                  </div>
                  <Switch
                    id="allowReplies"
                    checked={formData.allowReplies}
                    onCheckedChange={(checked) => handleInputChange('allowReplies', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Campaign</CardTitle>
                <CardDescription>
                  Send a test {formData.type} before launching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testContact">
                    Test {formData.type === 'email' ? 'Email' : 'Phone Number'}
                  </Label>
                  <Input
                    id="testContact"
                    type={formData.type === 'email' ? 'email' : 'tel'}
                    placeholder={formData.type === 'email' ? 'test@example.com' : '+1234567890'}
                    value={formData.testContact}
                    onChange={(e) => handleInputChange('testContact', e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleSendTest} className="w-full">
                  {formData.type === 'email' ? <AtSign className="mr-2 h-4 w-4" /> : <Smartphone className="mr-2 h-4 w-4" />}
                  Send Test {formData.type === 'email' ? 'Email' : 'SMS'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleScheduleClick} 
            disabled={isLoading || !isFormValid()}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          
          <Button 
            onClick={handleSendCampaign} 
            disabled={isLoading || !isFormValid()}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {formData.isScheduled ? 'Scheduling...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {formData.isScheduled ? 'Schedule Campaign' : 'Send Campaign'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {!isFormValid() && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Fill in required fields (name, type, message, audience) to enable sending
        </p>
      )}
      
      {/* Schedule Dialog */}
      <ScheduleDialog
        isOpen={scheduleDialog.isOpen}
        onOpenChange={scheduleDialog.closeDialog}
        onConfirm={handleScheduleCampaign}
        title="Schedule Campaign"
        description="Choose when to send this campaign"
      />
    </div>
  );
}