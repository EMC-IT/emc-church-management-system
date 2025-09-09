'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const categories = [
  'Worship',
  'Study',
  'Conference',
  'Outreach',
  'Social',
  'Training',
  'Youth',
  'Children',
  'Prayer',
  'Fellowship'
];

const groups = [
  { id: '1', name: 'Youth Ministry' },
  { id: '2', name: 'Children Ministry' },
  { id: '3', name: 'Worship Team' },
  { id: '4', name: 'Ushering Team' },
  { id: '5', name: 'Media Team' },
  { id: '6', name: 'Prayer Team' },
  { id: '7', name: 'Outreach Team' },
  { id: '8', name: 'Finance Committee' }
];

// Mock existing event data
const mockEventData = {
  id: '1',
  title: 'Sunday Service',
  description: 'Weekly Sunday worship service with communion and special music ministry.',
  category: 'Worship',
  date: new Date('2024-01-21'),
  startTime: '10:00',
  endTime: '12:00',
  location: 'Main Sanctuary',
  maxAttendees: '500',
  registrationRequired: true,
  registrationDeadline: new Date('2024-01-20'),
  organizer: 'Pastor John Smith',
  contactEmail: 'pastor.john@church.com',
  contactPhone: '(555) 123-4567',
  notes: 'Please arrive 15 minutes early for seating. Communion will be served during the service.',
  linkedGroups: ['3', '4', '5'] // Worship Team, Ushering Team, Media Team
};

interface EventFormData {
  title: string;
  description: string;
  category: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: string;
  registrationRequired: boolean;
  registrationDeadline: Date | undefined;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  linkedGroups: string[];
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    date: undefined,
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: '',
    registrationRequired: false,
    registrationDeadline: undefined,
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    linkedGroups: []
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  useEffect(() => {
    // Simulate loading existing event data
    const loadEventData = async () => {
      setInitialLoading(true);
      try {
        // In real app, fetch data based on params.id
        await new Promise(resolve => setTimeout(resolve, 500));
        setFormData({
          title: mockEventData.title,
          description: mockEventData.description,
          category: mockEventData.category,
          date: mockEventData.date,
          startTime: mockEventData.startTime,
          endTime: mockEventData.endTime,
          location: mockEventData.location,
          maxAttendees: mockEventData.maxAttendees,
          registrationRequired: mockEventData.registrationRequired,
          registrationDeadline: mockEventData.registrationDeadline,
          organizer: mockEventData.organizer,
          contactEmail: mockEventData.contactEmail,
          contactPhone: mockEventData.contactPhone,
          notes: mockEventData.notes,
          linkedGroups: mockEventData.linkedGroups
        });
      } catch (error) {
        toast.error('Failed to load event data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadEventData();
  }, [params.id]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Event date is required' as any;
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
      newErrors.maxAttendees = 'Max attendees must be a number';
    }

    if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Event updated successfully!');
      router.push(`/dashboard/events/${params.id}`);
    } catch (error) {
      toast.error('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedGroups: prev.linkedGroups.includes(groupId)
        ? prev.linkedGroups.filter(id => id !== groupId)
        : [...prev.linkedGroups, groupId]
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
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
            <Edit className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground">Update event details and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
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
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Date & Time
            </CardTitle>
            <CardDescription>When will this event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.date ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Capacity
            </CardTitle>
            <CardDescription>Where will this event be held?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Main Sanctuary, Fellowship Hall"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  className={errors.maxAttendees ? 'border-red-500' : ''}
                />
                {errors.maxAttendees && <p className="text-sm text-red-500">{errors.maxAttendees}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Settings
            </CardTitle>
            <CardDescription>Configure event registration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="registrationRequired"
                checked={formData.registrationRequired}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registrationRequired: !!checked }))}
              />
              <Label htmlFor="registrationRequired">Require registration for this event</Label>
            </div>

            {formData.registrationRequired && (
              <div className="space-y-2">
                <Label>Registration Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.registrationDeadline ? format(formData.registrationDeadline, 'PPP') : 'Select deadline'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.registrationDeadline}
                      onSelect={(date) => setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Organizer Information</CardTitle>
            <CardDescription>Contact details for the event organizer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Enter organizer name"
                  className={errors.organizer ? 'border-red-500' : ''}
                />
                {errors.organizer && <p className="text-sm text-red-500">{errors.organizer}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="organizer@church.com"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Linked Groups/Departments</CardTitle>
            <CardDescription>Select groups or departments involved in this event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={formData.linkedGroups.includes(group.id)}
                    onCheckedChange={() => handleGroupToggle(group.id)}
                  />
                  <Label htmlFor={`group-${group.id}`} className="text-sm">
                    {group.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any additional information about the event</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions, requirements, or notes..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-brand-primary hover:bg-brand-primary/90"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}