'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  Save,
  Loader2,
  School,
  Users,
  Calendar,
  MapPin,
  GraduationCap,
  Target
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { ClassFormData, AgeGroup, Teacher } from '@/lib/types/sunday-school';
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

export default function AddClassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
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
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await sundaySchoolService.getTeachers({
        status: 'Active',
        limit: 100
      });
      
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoadingTeachers(false);
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
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleObjectivesChange = (value: string) => {
    const objectives = value.split('\n').filter(obj => obj.trim() !== '');
    setFormData(prev => ({ ...prev, objectives }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Class name must be at least 2 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Class description is required';
    }
    
    if (!formData.teacherId) {
      newErrors.teacherId = 'Please select a teacher';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.maxStudents < 1) {
      newErrors.maxStudents = 'Maximum students must be at least 1';
    }
    
    if (!formData.schedule.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.schedule.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (formData.schedule.startTime && formData.schedule.endTime) {
      if (formData.schedule.startTime >= formData.schedule.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
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
      const response = await sundaySchoolService.createClass(formData);
      
      if (response.success) {
        toast.success('Class created successfully');
        router.push('/dashboard/sunday-school/classes');
      } else {
        toast.error(response.message || 'Failed to create class');
      }
    } catch (error) {
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/sunday-school/classes');
  };

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
              <h1 className="text-3xl font-bold tracking-tight">Create New Class</h1>
              <p className="text-muted-foreground">Set up a new Sunday School class</p>
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
                  <School className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the new class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Little Lambs"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group *</Label>
                    <Select
                      value={formData.ageGroup}
                      onValueChange={(value) => handleInputChange('ageGroup', value as AgeGroup)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map((ageGroup) => (
                          <SelectItem key={ageGroup} value={ageGroup}>
                            {ageGroup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the class purpose and activities..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Teacher Assignment</span>
                </CardTitle>
                <CardDescription>
                  Assign a teacher to lead this class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="teacher">Primary Teacher *</Label>
                    {loadingTeachers ? (
                      <div className="flex items-center space-x-2 p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading teachers...</span>
                      </div>
                    ) : (
                      <Select
                        value={formData.teacherId}
                        onValueChange={(value) => handleInputChange('teacherId', value)}
                      >
                        <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''}>
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
                    )}
                    {errors.teacherId && (
                      <p className="text-sm text-red-500">{errors.teacherId}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Maximum Students *</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxStudents}
                      onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 0)}
                      className={errors.maxStudents ? 'border-red-500' : ''}
                    />
                    {errors.maxStudents && (
                      <p className="text-sm text-red-500">{errors.maxStudents}</p>
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
                  Set the class schedule and meeting location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select
                      value={formData.schedule.dayOfWeek}
                      onValueChange={(value) => handleInputChange('schedule', { dayOfWeek: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.schedule.startTime}
                      onChange={(e) => handleInputChange('schedule', { startTime: e.target.value })}
                      className={errors.startTime ? 'border-red-500' : ''}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-red-500">{errors.startTime}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.schedule.endTime}
                      onChange={(e) => handleInputChange('schedule', { endTime: e.target.value })}
                      className={errors.endTime ? 'border-red-500' : ''}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-red-500">{errors.endTime}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room A1, Youth Hall"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location}</p>
                  )}
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
                  Define the curriculum and learning objectives (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="curriculum">Curriculum</Label>
                  <Input
                    id="curriculum"
                    placeholder="e.g., Bible Stories for Kids, Youth Discipleship"
                    value={formData.curriculum || ''}
                    onChange={(e) => handleInputChange('curriculum', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    placeholder="Enter each objective on a new line...\ne.g.:\nLearn basic Bible stories\nDevelop prayer habits\nBuild Christian friendships"
                    value={formData.objectives?.join('\n') || ''}
                    onChange={(e) => handleObjectivesChange(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter each objective on a separate line
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Class Name</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.name || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Age Group</p>
                    <p className="text-sm text-muted-foreground">{formData.ageGroup}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Teacher</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.teacherId 
                        ? teachers.find(t => t.id === formData.teacherId)?.name || 'Loading...'
                        : 'Not assigned'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.schedule.dayOfWeek} {formData.schedule.startTime} - {formData.schedule.endTime}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.location || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.maxStudents} students
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
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Class
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}