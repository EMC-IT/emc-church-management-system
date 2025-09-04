'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Users,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { groupsService } from '@/services';
import { GroupFormData } from '@/lib/types';
import { toast } from 'sonner';


const categories = ['Ministry', 'Fellowship', 'Study', 'Prayer', 'Outreach', 'Service'];
const statusOptions = ['Active', 'Inactive', 'Archived'];

export default function AddGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    category: '',
    leader: {
      id: '',
      name: '',
      email: '',
      phone: ''
    },
    maxMembers: 50,
    meetingSchedule: '',
    location: '',
    status: 'Active'
  });

  

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('leader.')) {
      const leaderField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        leader: {
          ...prev.leader,
          [leaderField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.leader.name.trim()) {
      toast.error('Group leader name is required');
      return;
    }
    
    if (!formData.leader.email.trim()) {
      toast.error('Group leader email is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await groupsService.createGroup({
        ...formData,
        leader: {
          ...formData.leader,
          id: formData.leader.id || `leader_${Date.now()}` // Generate ID if not provided
        }
      });
      
      if (response.success) {
        toast.success('Group created successfully');
        router.push('/dashboard/groups');
      } else {
        toast.error(response.message || 'Failed to create group');
      }
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/groups');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Group</h1>
              <p className="text-muted-foreground">Add a new group to your church community</p>
            </div>
          </div>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the new group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <UILabel htmlFor="name">Group Name *</UILabel>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter group name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <UILabel htmlFor="category">Category *</UILabel>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <UILabel htmlFor="description">Description</UILabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <UILabel htmlFor="maxMembers">Maximum Members</UILabel>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={formData.maxMembers}
                      onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 0)}
                      placeholder="Enter maximum members"
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <UILabel htmlFor="status">Status</UILabel>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Meeting Details</span>
                </CardTitle>
                <CardDescription>
                  Specify when and where the group meets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <UILabel htmlFor="meetingSchedule">Meeting Schedule</UILabel>
                    <Input
                      id="meetingSchedule"
                      value={formData.meetingSchedule}
                      onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                      placeholder="e.g., Fridays 6:00 PM"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <UILabel htmlFor="location">Location</UILabel>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Youth Center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Leader */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Group Leader</span>
                </CardTitle>
                <CardDescription>
                  Assign a leader for this group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <UILabel htmlFor="leaderName">Leader Name *</UILabel>
                    <Input
                      id="leaderName"
                      value={formData.leader.name}
                      onChange={(e) => handleInputChange('leader.name', e.target.value)}
                      placeholder="Enter leader name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <UILabel htmlFor="leaderEmail">Leader Email *</UILabel>
                    <Input
                      id="leaderEmail"
                      type="email"
                      value={formData.leader.email}
                      onChange={(e) => handleInputChange('leader.email', e.target.value)}
                      placeholder="Enter leader email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <UILabel htmlFor="leaderPhone">Leader Phone</UILabel>
                  <Input
                    id="leaderPhone"
                    value={formData.leader.phone}
                    onChange={(e) => handleInputChange('leader.phone', e.target.value)}
                    placeholder="Enter leader phone number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Save or cancel your changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Group
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Choose a descriptive name that reflects the group's purpose</p>
                <p>• Select the most appropriate category for better organization</p>
                <p>• Set a realistic maximum member limit</p>
                <p>• Ensure the leader's contact information is accurate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}