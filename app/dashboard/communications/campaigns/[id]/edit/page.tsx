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
  History,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignFormData {
  name: string;
  type: 'email' | 'sms';
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
  status: 'draft' | 'scheduled' | 'completed' | 'sending';
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

// Mock data - in real app, this would come from API
const mockCampaign = {
  id: '1',
  name: 'Sunday Service Reminder',
  type: 'sms',
  subject: '',
  message: 'Don\'t forget about Sunday service at 9:30 AM! We\'re excited to see you there. 🙏',
  targetAudience: ['all-members', 'new-members'],
  scheduledDate: '2024-01-14',
  scheduledTime: '08:00',
  isScheduled: true,
  sendTestMessage: false,
  testContact: '',
  trackOpens: true,
  trackClicks: true,
  allowReplies: true,
  status: 'completed',
  createdAt: '2024-01-10T14:30:00Z',
  updatedAt: '2024-01-13T16:45:00Z'
};

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    type: 'email',
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
    allowReplies: false,
    status: 'draft'
  });

  useEffect(() => {
    // In real app, fetch campaign by ID
    // For now, use mock data
    setFormData({
      name: mockCampaign.name,
      type: mockCampaign.type as 'email' | 'sms',
      subject: mockCampaign.subject,
      message: mockCampaign.message,
      targetAudience: mockCampaign.targetAudience,
      scheduledDate: mockCampaign.scheduledDate,
      scheduledTime: mockCampaign.scheduledTime,
      isScheduled: mockCampaign.isScheduled,
      sendTestMessage: mockCampaign.sendTestMessage,
      testContact: mockCampaign.testContact,
      trackOpens: mockCampaign.trackOpens,
      trackClicks: mockCampaign.trackClicks,
      allowReplies: mockCampaign.allowReplies,
      status: mockCampaign.status as 'draft' | 'scheduled' | 'completed' | 'sending'
    });
  }, [params.id]);

  const handleInputChange = (field: keyof CampaignFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Campaign updated and saved as draft');
      router.push('/dashboard/communications/campaigns');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCampaign = async () => {
    if (!formData.name.trim() || !formData.message.trim() || formData.targetAudience.length === 0) {
      toast.error('Please fill in all required fields and select at least one audience');
      return;
    }

    if (formData.type === 'email' && !formData.subject.trim()) {
      toast.error('Email subject is required');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.isScheduled) {
        toast.success('Campaign updated and scheduled successfully');
      } else {
        toast.success('Campaign updated successfully');
      }
      
      router.push(`/dashboard/communications/campaigns/${params.id}`);
    } catch (error) {
      toast.error('Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      case 'sending': return 'default';
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

  const canEdit = formData.status === 'draft' || formData.status === 'scheduled';

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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Campaign</h1>
            <p className="text-muted-foreground">Update campaign content and settings</p>
          </div>
        </div>

        {/* Current Status */}
        <Badge variant={getStatusColor(formData.status)} className="flex items-center gap-1">
          {getStatusIcon(formData.status)}
          Current: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
        </Badge>
      </div>

      {!canEdit && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">
                This campaign has already been sent and cannot be edited. You can duplicate it to create a new campaign.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
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

        {/* Content Editor */}
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
                    Update your {formData.type === 'email' ? 'email' : 'SMS'} campaign content
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
                      disabled={!canEdit}
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
                        disabled={!canEdit}
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
                      disabled={!canEdit}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Type</CardTitle>
                </CardHeader>
                <CardContent>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(mockCampaign.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Audience Selection */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Target Audience</CardTitle>
              <CardDescription>Modify which groups will receive this campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {audienceGroups.map((group) => (
                  <Card 
                    key={group.id}
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      formData.targetAudience.includes(group.id) ? 'ring-2 ring-brand-primary bg-brand-primary/5' : ''
                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => canEdit && handleAudienceToggle(group.id)}
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
                <CardDescription>Update when to send your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="scheduled"
                    checked={formData.isScheduled}
                    onCheckedChange={(checked) => handleInputChange('isScheduled', checked)}
                    disabled={!canEdit}
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
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Time</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking & Analytics</CardTitle>
                <CardDescription>Update campaign tracking options</CardDescription>
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
                        disabled={!canEdit}
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
                        disabled={!canEdit}
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
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Campaign</CardTitle>
                  <CardDescription>
                    Send a test {formData.type} before updating
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
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push(`/dashboard/communications/campaigns/${params.id}`)}>
          Cancel Changes
        </Button>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleUpdateCampaign} disabled={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              {formData.isScheduled ? 'Update & Schedule' : 'Update Campaign'}
            </Button>
          </div>
        ) : (
          <Button onClick={() => router.push('/dashboard/communications/campaigns/add')}>
            <Send className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        )}
      </div>
    </div>
  );
}