'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Loader2 } from 'lucide-react';
import { format, formatDate } from 'date-fns';
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

export default function AddEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      
      toast.success('Event created successfully!');
      router.push('/dashboard/events');
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Create Event</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule a church service, conference, outreach, or ministry event.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Annual Church Conference 2026"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe event focus, key speakers, schedule, and purpose..."
                  rows={3}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Date & Location */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Schedule & Location</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
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
                {errors.date && <p className="text-xs text-destructive">{String(errors.date)}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
                {errors.endTime && <p className="text-xs text-destructive">{errors.endTime}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="location">Location / Venue *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Main Sanctuary"
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Capacity & Registration Settings */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Capacity & Registration</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                />
                {errors.maxAttendees && <p className="text-xs text-destructive">{errors.maxAttendees}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 flex items-center pt-6 space-x-2">
                <Checkbox
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registrationRequired: !!checked }))}
                />
                <Label htmlFor="registrationRequired" className="text-xs text-foreground cursor-pointer">
                  Require attendee registration
                </Label>
              </div>

              {formData.registrationRequired && (
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  <Label>Registration Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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
            </div>
          </div>
        </Card>

        {/* Organizer Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Organizer Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="e.g. Pastor David Appiah"
                />
                {errors.organizer && <p className="text-xs text-destructive">{errors.organizer}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="organizer@church.com"
                />
                {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+233 24 123 4567"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Linked Groups & Notes */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Linked Groups & Special Notes</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 space-y-2">
                <Label className="text-xs text-muted-foreground">Linked Groups / Departments</Label>
                <div className="grid grid-cols-12 gap-3 pt-1">
                  {groups.map((group) => (
                    <div key={group.id} className="col-span-12 sm:col-span-6 lg:col-span-3 flex items-center space-x-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={formData.linkedGroups.includes(group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`} className="text-xs font-medium cursor-pointer">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-12 space-y-2 pt-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any special instructions, setup requirements, or equipment needs..."
                  rows={3}
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
            onClick={() => router.push('/dashboard/events')}
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
              'Create Event'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}