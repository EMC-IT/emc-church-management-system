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
import { 
  ArrowLeft,
  FileText,
  Save,
  Send,
  Calendar,
  Users,
  Mail,
  Eye,
  Layout,
  Image,
  Type,
  Link,
  Bold,
  Italic,
  List,
  AlignLeft,
  AlignCenter,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { ScheduleDialog, useScheduleDialog } from '@/components/ui/schedule-dialog';

interface NewsletterFormData {
  title: string;
  subject: string;
  template: string;
  content: string;
  previewText: string;
  scheduledDate: string;
  scheduledTime: string;
  isScheduled: boolean;
  sendTestEmail: boolean;
  testEmail: string;
  subscriberGroups: string[];
}

const templates = [
  {
    id: 'weekly-update',
    name: 'Weekly Update',
    description: 'Standard weekly church newsletter template',
    preview: '/templates/weekly-update.jpg',
    sections: ['Header', 'Pastor Message', 'Upcoming Events', 'Prayer Requests', 'Footer']
  },
  {
    id: 'youth-ministry',
    name: 'Youth Ministry',
    description: 'Vibrant template for youth-focused content',
    preview: '/templates/youth-ministry.jpg',
    sections: ['Header', 'Youth Events', 'Testimonies', 'Games & Activities', 'Footer']
  },
  {
    id: 'prayer-letter',
    name: 'Prayer Letter',
    description: 'Simple, focused template for prayer communications',
    preview: '/templates/prayer-letter.jpg',
    sections: ['Header', 'Prayer Requests', 'Testimonies', 'Scripture', 'Footer']
  },
  {
    id: 'holiday-special',
    name: 'Holiday Special',
    description: 'Festive template for special occasions',
    preview: '/templates/holiday-special.jpg',
    sections: ['Header', 'Holiday Message', 'Special Events', 'Community', 'Footer']
  },
  {
    id: 'blank',
    name: 'Blank Template',
    description: 'Start from scratch with a blank canvas',
    preview: '/templates/blank.jpg',
    sections: ['Custom Content']
  }
];

const subscriberGroups = [
  'All Subscribers',
  'Church Members',
  'Youth Group',
  'Adult Ministry',
  'Children Ministry',
  'Prayer Group',
  'Volunteers',
  'New Members',
  'Small Groups',
  'Church Leaders'
];

export default function AddNewsletterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('template');
  const scheduleDialog = useScheduleDialog();
  const [formData, setFormData] = useState<NewsletterFormData>({
    title: '',
    subject: '',
    template: '',
    content: '',
    previewText: '',
    scheduledDate: '',
    scheduledTime: '',
    isScheduled: false,
    sendTestEmail: false,
    testEmail: '',
    subscriberGroups: ['All Subscribers']
  });

  const handleInputChange = (field: keyof NewsletterFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        content: generateTemplateContent(template)
      }));
      setActiveTab('content');
    }
  };

  const generateTemplateContent = (template: any) => {
    // Generate basic template content based on template type
    switch (template.id) {
      case 'weekly-update':
        return `<h2>Pastor's Message</h2>\n<p>Welcome to this week's church newsletter...</p>\n\n<h2>Upcoming Events</h2>\n<ul>\n<li>Sunday Service - 9:30 AM</li>\n<li>Bible Study - Wednesday 7:00 PM</li>\n</ul>\n\n<h2>Prayer Requests</h2>\n<p>Please keep these members in your prayers...</p>`;
      case 'youth-ministry':
        return `<h2>Youth Events This Week</h2>\n<p>Exciting activities planned for our youth...</p>\n\n<h2>Testimonies</h2>\n<p>Hear from our young people about God's work in their lives...</p>`;
      case 'prayer-letter':
        return `<h2>Prayer Requests</h2>\n<p>Dear prayer warriors, please lift up these requests...</p>\n\n<h2>Praise Reports</h2>\n<p>Celebrating God's faithfulness...</p>`;
      default:
        return '<p>Start writing your newsletter content here...</p>';
    }
  };

  // Form validation
  const isFormValid = () => {
    return formData.title.trim() && formData.subject.trim() && formData.template && formData.content.trim();
  };
  
  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error('Please enter at least a title or content to save as draft');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Newsletter saved as draft');
      router.push('/dashboard/communications/newsletters');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields (title, subject, template, and content)');
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
        toast.success(`Newsletter scheduled for ${scheduledDateTime.toLocaleString()}`);
      } else {
        toast.success('Newsletter sent successfully');
      }
      
      router.push('/dashboard/communications/newsletters');
    } catch (error) {
      toast.error('Failed to send newsletter');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleNewsletter = async (scheduleData: any) => {
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
      toast.success(`Newsletter scheduled for ${scheduledTime.toLocaleString()}`);
      
      scheduleDialog.closeDialog();
      router.push('/dashboard/communications/newsletters');
    } catch (error) {
      toast.error('Failed to schedule newsletter');
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
    if (!formData.testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Test email sent to ${formData.testEmail}`);
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.template);

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
            <FileText className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Newsletter</h1>
            <p className="text-muted-foreground">Design and send newsletters to your congregation</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Template
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Template Selection */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>Select a template to get started with your newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.template === template.id ? 'ring-2 ring-brand-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2">
                        <Layout className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.sections.map((section) => (
                            <Badge key={section} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Editor */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Details</CardTitle>
                  <CardDescription>Basic information about your newsletter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Newsletter Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter newsletter title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject Line *</Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject..."
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preview">Preview Text</Label>
                    <Input
                      id="preview"
                      placeholder="Brief preview text that appears in email clients..."
                      value={formData.previewText}
                      onChange={(e) => handleInputChange('previewText', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      This text appears in email previews (recommended: 50-100 characters)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Editor</CardTitle>
                  <CardDescription>
                    {selectedTemplate ? `Editing with ${selectedTemplate.name} template` : 'Create your newsletter content'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Simple Toolbar */}
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <Button variant="ghost" size="sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Write your newsletter content here... You can use HTML formatting."
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="min-h-96 font-mono text-sm"
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    You can use HTML tags for formatting. Images should be hosted externally.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Info</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{selectedTemplate.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Template Sections:</p>
                        <div className="space-y-1">
                          {selectedTemplate.sections.map((section) => (
                            <Badge key={section} variant="outline" className="text-xs mr-1">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No template selected</p>
                   )}
                 </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Image className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Link className="mr-2 h-4 w-4" />
                    Insert Link
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>Configure when and how to send your newsletter</CardDescription>
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
                <CardTitle>Subscriber Groups</CardTitle>
                <CardDescription>Choose who will receive this newsletter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {subscriberGroups.map((group) => (
                    <div key={group} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={group}
                        checked={formData.subscriberGroups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('subscriberGroups', [...formData.subscriberGroups, group]);
                          } else {
                            handleInputChange('subscriberGroups', formData.subscriberGroups.filter(g => g !== group));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={group} className="text-sm">{group}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Email</CardTitle>
                <CardDescription>Send a test email before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.testEmail}
                    onChange={(e) => handleInputChange('testEmail', e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleSendTest} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Preview</CardTitle>
              <CardDescription>How your newsletter will appear to subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h1 className="text-2xl font-bold">{formData.title || 'Newsletter Title'}</h1>
                    <p className="text-muted-foreground">{formData.previewText || 'Preview text will appear here'}</p>
                  </div>
                  
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formData.content || '<p>Your newsletter content will appear here...</p>' 
                    }}
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
            onClick={handleSendNewsletter} 
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
                {formData.isScheduled ? 'Schedule Newsletter' : 'Send Newsletter'}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {!isFormValid() && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Fill in required fields (title, subject, template, content) to enable sending
        </p>
       )}
       
       {/* Schedule Dialog */}
       <ScheduleDialog
         isOpen={scheduleDialog.isOpen}
         onOpenChange={scheduleDialog.closeDialog}
         onConfirm={handleScheduleNewsletter}
         title="Schedule Newsletter"
         description="Choose when to send this newsletter"
       />
     </div>
   );
}