'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  User,
  Trash2
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupFormData } from '@/lib/types/groups';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categories = ['Ministry', 'Fellowship', 'Study', 'Prayer', 'Outreach', 'Service'];
const statusOptions = ['Active', 'Inactive', 'Archived'];

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const response = await groupsService.getGroup(groupId);
      
      if (response.success && response.data) {
        const groupData = response.data;
        setGroup(groupData);
        setFormData({
          name: groupData.name,
          description: groupData.description,
          category: groupData.category,
          leader: groupData.leader,
          maxMembers: groupData.maxMembers,
          meetingSchedule: groupData.meetingSchedule,
          location: groupData.location,
          status: groupData.status
        });
      } else {
        toast.error('Group not found');
        router.push('/dashboard/groups');
      }
    } catch (error) {
      toast.error('Failed to load group');
      router.push('/dashboard/groups');
    } finally {
      setLoading(false);
    }
  };



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
    
    setSaving(true);
    
    try {
      const response = await groupsService.updateGroup(groupId, formData);
      
      if (response.success) {
        toast.success('Group updated successfully');
        router.push(`/dashboard/groups/${groupId}`);
      } else {
        toast.error(response.message || 'Failed to update group');
      }
    } catch (error) {
      toast.error('Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const response = await groupsService.deleteGroup(groupId);
      
      if (response.success) {
        toast.success('Group deleted successfully');
        router.push('/dashboard/groups');
      } else {
        toast.error(response.message || 'Failed to delete group');
      }
    } catch (error) {
      toast.error('Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Group Not Found</h2>
          <p className="text-muted-foreground mt-2">The group you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/groups')} className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold tracking-tight">Edit Group</h1>
              <p className="text-muted-foreground">Update group information and settings</p>
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
                  Update the basic details for this group
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
                  Update when and where the group meets
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
                  Update the leader information for this group
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
                  Save changes or cancel editing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <UILabel className="text-muted-foreground">Current Members</UILabel>
                  <p className="font-medium">{group.members} of {group.maxMembers}</p>
                </div>
                
                <div>
                  <UILabel className="text-muted-foreground">Engagement Rate</UILabel>
                  <p className="font-medium">{group.engagement}%</p>
                </div>
                
                <div>
                  <UILabel className="text-muted-foreground">Created</UILabel>
                  <p className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <UILabel className="text-muted-foreground">Last Updated</UILabel>
                  <p className="font-medium">{new Date(group.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Group
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the group
                        "{group.name}" and remove all associated data including members, events, and attendance records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}