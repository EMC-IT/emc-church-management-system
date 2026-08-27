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
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'primary';
      case 'low': return 'neutral';
      default: return 'primary';
    }
  };

  const filteredMembers = getFilteredMembers();
  const selectedMembers = getSelectedMembers();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/communications/messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Compose Message</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recipients Card */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">Message Type & Recipients</h2>
              <Tabs 
                value={formData.type} 
                onValueChange={(value) => handleInputChange('type', value as 'individual' | 'group')}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-2 w-full sm:w-[260px]">
                  <TabsTrigger value="individual" className="flex items-center gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5" />
                    Individual
                  </TabsTrigger>
                  <TabsTrigger value="group" className="flex items-center gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" />
                    Group Message
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Selected Recipients */}
            {selectedMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Selected Recipients ({selectedMembers.length})</Label>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/40">
                  {selectedMembers.map((member) => (
                    <Badge key={member.id} variant="neutral" className="flex items-center gap-2 py-1 px-2.5">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-normal">{member.name}</span>
                      <button
                        type="button"
                        className="h-3.5 w-3.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        onClick={() => handleRemoveRecipient(member.id)}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, role, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-12 sm:col-span-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSelectAll}
                  className="w-full text-xs"
                >
                  {filteredMembers.every(member => formData.recipients.includes(member.id)) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {/* Members List */}
            <div className="max-h-56 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleRecipientToggle(member.id)}
                >
                  <Checkbox
                    checked={formData.recipients.includes(member.id)}
                    onCheckedChange={() => handleRecipientToggle(member.id)}
                  />
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${getStatusColor(member.status)}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  <Badge variant="neutral" className="text-xs font-normal shrink-0">{member.department}</Badge>
                </div>
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                  <p className="text-xs">No members found matching your search</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Message Content */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Message Details</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="Rehearsal schedule update / Prayer meeting notice"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => handleInputChange('priority', value)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message Body *</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.message.length}/1000 characters
                  </span>
                </div>
                <Textarea
                  id="message"
                  placeholder="Message body..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/communications/messages')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isLoading}
          >
            Save as Draft
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || selectedMembers.length === 0 || !formData.message.trim()}
          >
            <Send className="mr-1.5 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}