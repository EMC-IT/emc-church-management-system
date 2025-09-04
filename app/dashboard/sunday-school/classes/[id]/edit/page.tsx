'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Save,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, ClassFormData, Teacher, AgeGroup, ClassStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

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
      dayOfWeek: '',
      startTime: '',
      endTime: ''
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
          teacherId: classInfo.teacher.id,
          maxStudents: classInfo.maxStudents,
          schedule: classInfo.schedule,
          location: classInfo.location,
          curriculum: classInfo.curriculum,
          objectives: classInfo.objectives
        });
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
      }
    } catch (error) {
      toast.error('Failed to load class data');
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
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const handleInputChange = (field: keyof ClassFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Class name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.teacherId) {
      newErrors.teacherId = 'Teacher selection is required';
    }
    
    if (!formData.schedule.dayOfWeek || !formData.schedule.startTime || !formData.schedule.endTime) {
      newErrors.schedule = 'Complete schedule information is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.maxStudents < 1 || formData.maxStudents > 100) {
      newErrors.maxStudents = 'Maximum students must be between 1 and 100';
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
    
    setSubmitting(true);
    
    try {
      const response = await sundaySchoolService.updateClass(classId, formData);
      
      if (response.success) {
        toast.success('Class updated successfully');
        router.push(`/dashboard/sunday-school/classes/${classId}`);
      } else {
        toast.error(response.message || 'Failed to update class');
      }
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to delete class');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground mt-2">The class you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/sunday-school/classes')} className="mt-4">
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <h1 className="text-3xl font-bold tracking-tight">Edit Class</h1>
              <p className="text-muted-foreground">Update class information and settings</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Class
          </Button>
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
                  <BookOpen className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update the basic details of the class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter class name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group *</Label>
                    <Select value={formData.ageGroup} onValueChange={(value) => handleInputChange('ageGroup', value)}>
                      <SelectTrigger className={errors.ageGroup ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AgeGroup).map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ageGroup && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.ageGroup}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the class purpose and activities"
                    rows={3}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.description}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Teacher & Capacity</span>
                </CardTitle>
                <CardDescription>
                  Assign teacher and set class capacity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Assigned Teacher *</Label>
                    <Select value={formData.teacherId} onValueChange={(value) => handleInputChange('teacherId', value)}>
                      <SelectTrigger className={errors.teacherId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.teacherId && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.teacherId}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Maximum Students *</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxStudents}
                      onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                      className={errors.maxStudents ? 'border-destructive' : ''}
                    />
                    {errors.maxStudents && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.maxStudents}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule & Location</span>
                </CardTitle>
                <CardDescription>
                  Set when and where the class meets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schedule *</Label>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <Select 
                          value={formData.schedule.dayOfWeek} 
                          onValueChange={(value) => handleInputChange('schedule', { ...formData.schedule, dayOfWeek: value })}
                        >
                          <SelectTrigger className={errors.schedule ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sunday">Sunday</SelectItem>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                            <SelectItem value="Saturday">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="time"
                          value={formData.schedule.startTime}
                          onChange={(e) => handleInputChange('schedule', { ...formData.schedule, startTime: e.target.value })}
                          className={errors.schedule ? 'border-destructive' : ''}
                        />
                      </div>
                      <div>
                        <Input
                          type="time"
                          value={formData.schedule.endTime}
                          onChange={(e) => handleInputChange('schedule', { ...formData.schedule, endTime: e.target.value })}
                          className={errors.schedule ? 'border-destructive' : ''}
                        />
                      </div>
                    </div>
                    {errors.schedule && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.schedule}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Room 101, Main Building"
                        className={errors.location ? 'border-destructive' : ''}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum & Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Curriculum & Objectives</span>
                </CardTitle>
                <CardDescription>
                  Define what will be taught and learning goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Textarea
                    id="curriculum"
                    value={formData.curriculum}
                    onChange={(e) => handleInputChange('curriculum', e.target.value)}
                    placeholder="Describe the curriculum and topics to be covered"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="objectives">Learning Objectives</Label>
                    <Textarea
                      id="objectives"
                      value={formData.objectives?.join('\n') || ''}
                      onChange={(e) => handleInputChange('objectives', e.target.value.split('\n').filter(obj => obj.trim()))}
                      placeholder="List the learning objectives and goals (one per line)"
                      rows={3}
                    />
                  </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Summary</CardTitle>
                <CardDescription>
                  Review your class details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Class Name</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.name || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Age Group</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.ageGroup}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Teacher</Label>
                    <p className="text-sm text-muted-foreground">
                      {teachers.find(t => t.id === formData.teacherId)?.name || 'Not assigned'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Capacity</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.maxStudents} students maximum
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Schedule</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.schedule.dayOfWeek && formData.schedule.startTime && formData.schedule.endTime 
                        ? `${formData.schedule.dayOfWeek}s ${formData.schedule.startTime} - ${formData.schedule.endTime}`
                        : 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.location || 'Not specified'}
                    </p>
                  </div>
                  

                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-primary hover:bg-brand-primary/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Class
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{classData.name}"? This action cannot be undone.
              All students will be removed from this class and attendance records will be preserved but archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Class'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}