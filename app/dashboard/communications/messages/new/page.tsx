'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  MessageCircle,
  Send,
  Search,
  Users,
  User,
  Paperclip,
  Image,
  Smile,
  AtSign,
  Hash,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageFormData {
  type: 'individual' | 'group';
  recipients: string[];
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  attachments: File[];
}

const churchMembers = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    role: 'Youth Leader',
    avatar: '/avatars/sarah.jpg',
    department: 'Youth Ministry',
    status: 'online'
  },
  {
    id: '2',
    name: 'Michael Davis',
    email: 'michael.davis@email.com',
    role: 'Volunteer Coordinator',
    avatar: '/avatars/michael.jpg',
    department: 'Volunteers',
    status: 'offline'
  },
  {
    id: '3',
    name: 'Mary Johnson',
    email: 'mary.johnson@email.com',
    role: 'Children Ministry Leader',
    avatar: '/avatars/mary.jpg',
    department: 'Children Ministry',
    status: 'away'
  },
  {
    id: '4',
    name: 'Elder Smith',
    email: 'elder.smith@email.com',
    role: 'Church Elder',
    avatar: '/avatars/elder-smith.jpg',
    department: 'Leadership',
    status: 'online'
  },
  {
    id: '5',
    name: 'Pastor John',
    email: 'pastor.john@email.com',
    role: 'Senior Pastor',
    avatar: '/avatars/pastor-john.jpg',
    department: 'Leadership',
    status: 'online'
  },
  {
    id: '6',
    name: 'Music Director',
    email: 'music@email.com',
    role: 'Worship Leader',
    avatar: '/avatars/music-director.jpg',
    department: 'Worship Team',
    status: 'online'
  }
];

const departments = [
  'All Departments',
  'Leadership',
  'Youth Ministry',
  'Children Ministry',
  'Worship Team',
  'Volunteers',
  'Prayer Team',
  'Outreach'
];

export default function NewMessagePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [formData, setFormData] = useState<MessageFormData>({
    type: 'individual',
    recipients: [],
    subject: '',
    message: '',
    priority: 'normal',
    attachments: []
  });

  const handleInputChange = (field: keyof MessageFormData, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecipientToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(memberId)
        ? prev.recipients.filter(id => id !== memberId)
        : [...prev.recipients, memberId]
    }));
  };

  const handleRemoveRecipient = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(id => id !== memberId)
    }));
  };

  const handleSelectAll = () => {
    const filteredMembers = getFilteredMembers();
    const allSelected = filteredMembers.every(member => formData.recipients.includes(member.id));
    
    if (allSelected) {
      // Deselect all filtered members
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter(id => !filteredMembers.some(member => member.id === id))
      }));
    } else {
      // Select all filtered members
      const newRecipients = Array.from(new Set([...formData.recipients, ...filteredMembers.map(member => member.id)]));
      setFormData(prev => ({
        ...prev,
        recipients: newRecipients
      }));
    }
  };

  const getFilteredMembers = () => {
    return churchMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'All Departments' || 
                               member.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  };

  const getSelectedMembers = () => {
    return churchMembers.filter(member => formData.recipients.includes(member.id));
  };

  const handleSendMessage = async () => {
    if (formData.recipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully');
      router.push('/dashboard/communications/messages');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message saved as draft');
      router.push('/dashboard/communications/messages');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filteredMembers = getFilteredMembers();
  const selectedMembers = getSelectedMembers();

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
            <MessageCircle className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compose Message</h1>
            <p className="text-muted-foreground">Send a message to church members</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Compose Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Type */}
          <Card>
            <CardHeader>
              <CardTitle>Message Type</CardTitle>
              <CardDescription>Choose how you want to send this message</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={formData.type} onValueChange={(value) => handleInputChange('type', value as 'individual' | 'group')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Individual
                  </TabsTrigger>
                  <TabsTrigger value="group" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Group Message
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>
                {formData.type === 'individual' 
                  ? 'Select church members to message individually'
                  : 'Select members for a group conversation'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Recipients */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Recipients ({selectedMembers.length})</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
                    {selectedMembers.map((member) => (
                      <Badge key={member.id} variant="secondary" className="flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveRecipient(member.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleSelectAll}>
                  {filteredMembers.every(member => formData.recipients.includes(member.id)) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Members List */}
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleRecipientToggle(member.id)}
                  >
                    <Checkbox
                      checked={formData.recipients.includes(member.id)}
                      onChange={() => handleRecipientToggle(member.id)}
                    />
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{member.department}</Badge>
                  </div>
                ))}
                
                {filteredMembers.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No members found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>Write your message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="Enter message subject..."
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="min-h-32"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.message.length}/1000 characters
                </p>
              </div>
              
              {/* Message Tools */}
              <div className="flex items-center gap-2 pt-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4 mr-2" />
                  Emoji
                </Button>
                <Button variant="ghost" size="sm">
                  <AtSign className="h-4 w-4 mr-2" />
                  Mention
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Message Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Message Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Message Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your message will appear</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getPriorityColor(formData.priority)} className="text-xs">
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                  </Badge>
                  {formData.type === 'group' && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Group Message
                    </Badge>
                  )}
                </div>
                
                {formData.subject && (
                  <h4 className="font-semibold mb-2">{formData.subject}</h4>
                )}
                
                <p className="text-sm text-muted-foreground mb-3">
                  {formData.message || 'Your message will appear here...'}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  To: {selectedMembers.length > 0 
                    ? selectedMembers.length === 1 
                      ? selectedMembers[0].name
                      : `${selectedMembers.length} recipients`
                    : 'No recipients selected'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Message Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Recipients:</span>
                <span className="font-semibold">{selectedMembers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Characters:</span>
                <span className="font-semibold">{formData.message.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Type:</span>
                <span className="font-semibold capitalize">{formData.type}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleSendMessage} 
              className="w-full" 
              disabled={isLoading || selectedMembers.length === 0 || !formData.message.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveDraft} 
              className="w-full" 
              disabled={isLoading}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}