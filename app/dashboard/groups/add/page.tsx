'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
    
    setLoading(true);
    try {
      const response = await groupsService.createGroup({
        ...formData,
        leader: {
          ...formData.leader,
          id: formData.leader.id || `leader_${Date.now()}`
        }
      });
      
      if (response.success) {
        toast.success('Group created successfully');
        router.push('/dashboard/groups');
      } else {
        toast.error(response.message || 'Failed to create group');
      }
    } catch {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Create Group</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Youth Fellowship"
                  required
                />
              </div>
              
              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category">
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

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
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

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="maxMembers">Maximum Capacity</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 0)}
                  placeholder="50"
                  min="1"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                <Input
                  id="meetingSchedule"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                  placeholder="Saturdays at 4:00 PM"
                />
              </div>
              
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="location">Location / Venue</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Fellowship Hall Room 2"
                />
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Purpose, focus, and meeting details..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Group Leader */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Group Leader</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderName">Leader Name *</Label>
                <Input
                  id="leaderName"
                  value={formData.leader.name}
                  onChange={(e) => handleInputChange('leader.name', e.target.value)}
                  placeholder="Grace Mensah"
                  required
                />
              </div>
              
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderEmail">Leader Email *</Label>
                <Input
                  id="leaderEmail"
                  type="email"
                  value={formData.leader.email}
                  onChange={(e) => handleInputChange('leader.email', e.target.value)}
                  placeholder="leader@example.com"
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderPhone">Leader Phone</Label>
                <Input
                  id="leaderPhone"
                  value={formData.leader.phone}
                  onChange={(e) => handleInputChange('leader.phone', e.target.value)}
                  placeholder="+233 24 123 4567"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/groups')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}