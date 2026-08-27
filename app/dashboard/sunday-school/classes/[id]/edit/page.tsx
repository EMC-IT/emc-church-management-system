'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, ClassFormData, Teacher, AgeGroup } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const ageGroups = Object.values(AgeGroup);
const daysOfWeek = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function EditClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    description: '',
    ageGroup: AgeGroup.PRIMARY,
    teacherId: '',
    maxStudents: 20,
    schedule: {
      dayOfWeek: 'Sunday',
      startTime: '09:00',
      endTime: '10:00'
    },
    location: '',
    curriculum: '',
    objectives: []
  });

  useEffect(() => {
    if (classId) {
      loadClassData();
      loadTeachers();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getClass(classId);
      if (response.success && response.data) {
        const classInfo = response.data;
        setClassData(classInfo);
        setFormData({
          name: classInfo.name,
          description: classInfo.description,
          ageGroup: classInfo.ageGroup as AgeGroup,
          teacherId: classInfo.teacher?.id || (classInfo as any).teacherId || '',
          maxStudents: classInfo.maxStudents || 20,
          schedule: classInfo.schedule || {
            dayOfWeek: 'Sunday',
            startTime: '09:00',
            endTime: '10:00'
          },
          location: classInfo.location || '',
          curriculum: classInfo.curriculum || '',
          objectives: classInfo.objectives || []
        });
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
      }
    } catch {
      toast.error('Failed to load class');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await sundaySchoolService.getTeachers();
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch {
      console.error('Failed to load teachers');
    }
  };

  const handleInputChange = (field: keyof ClassFormData, value: any) => {
    if (field === 'schedule') {
      setFormData(prev => ({
        ...prev,
        schedule: { ...prev.schedule, ...value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.location.trim()) newErrors.location = 'Location/Room is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const response = await sundaySchoolService.updateClass(classId, formData);
      if (response.success) {
        toast.success('Class updated successfully');
        router.push(`/dashboard/sunday-school/classes/${classId}`);
      } else {
        toast.error(response.message || 'Failed to update class');
      }
    } catch {
      toast.error('Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await sundaySchoolService.deleteClass(classId);
      if (response.success) {
        toast.success('Class deleted successfully');
        router.push('/dashboard/sunday-school/classes');
      } else {
        toast.error(response.message || 'Failed to delete class');
      }
    } catch {
      toast.error('Failed to delete class');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/sunday-school/classes/${classId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Class</h1>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive shrink-0 self-start sm:self-auto"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete Class
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">General Information</h2>

            <div className="grid grid-cols-12 gap-5">
              {/* Class Name (12 cols) */}
              <div className="col-span-12 space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Beginners (Ages 3-5)"
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Age Group (6 cols) */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="ageGroup">Age Group *</Label>
                <Select
                  value={formData.ageGroup}
                  onValueChange={(val) => handleInputChange('ageGroup', val as AgeGroup)}
                >
                  <SelectTrigger id="ageGroup">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned Teacher (6 cols) */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="teacherId">Assigned Teacher *</Label>
                <Select
                  value={formData.teacherId}
                  onValueChange={(val) => handleInputChange('teacherId', val)}
                >
                  <SelectTrigger id="teacherId">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teacherId && <p className="text-xs text-destructive">{errors.teacherId}</p>}
              </div>

              {/* Description (12 cols) */}
              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional class details and notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Schedule & Room */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Schedule & Room</h2>

            {/* Row 1: Meeting Day (3), Start Time (3), End Time (3), Room / Location (3) */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="day">Meeting Day</Label>
                <Select
                  value={formData.schedule.dayOfWeek}
                  onValueChange={(val) => handleInputChange('schedule', { dayOfWeek: val })}
                >
                  <SelectTrigger id="day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => handleInputChange('schedule', { startTime: e.target.value })}
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => handleInputChange('schedule', { endTime: e.target.value })}
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="location">Room / Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g. Room 102"
                  required
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>
            </div>

            {/* Row 2: Capacity (3), Curriculum / Study Material (9) */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 lg:col-span-3 space-y-2">
                <Label htmlFor="maxStudents">Capacity</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <div className="col-span-12 sm:col-span-8 lg:col-span-9 space-y-2">
                <Label htmlFor="curriculum">Curriculum / Study Material</Label>
                <Input
                  id="curriculum"
                  value={formData.curriculum || ''}
                  onChange={(e) => handleInputChange('curriculum', e.target.value)}
                  placeholder="e.g. New Life in Christ (Primary)"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/sunday-school/classes/${classId}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{classData?.name}&quot;? All student enrollments and records for this class will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Class'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}