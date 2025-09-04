'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  Filter,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student, AgeGroup } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function AddStudentsToClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('all');

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  useEffect(() => {
    filterStudents();
  }, [availableStudents, searchTerm, ageFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load class data
      const classResponse = await sundaySchoolService.getClass(classId);
      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      // Load all students
      const allStudentsResponse = await sundaySchoolService.getStudents();
      if (allStudentsResponse.success && allStudentsResponse.data) {
        setAllStudents(allStudentsResponse.data);
      }
      
      // Load currently enrolled students
      const enrolledResponse = await sundaySchoolService.getClassStudents(classId);
      if (enrolledResponse.success && enrolledResponse.data) {
        setEnrolledStudents(enrolledResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter out already enrolled students
    const enrolledIds = new Set(enrolledStudents.map(s => s.id));
    const available = allStudents.filter(student => !enrolledIds.has(student.id));
    setAvailableStudents(available);
  }, [allStudents, enrolledStudents]);

  const filterStudents = () => {
    let filtered = [...availableStudents];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentContact.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentContact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply age filter
    if (ageFilter !== 'all') {
      const ageRange = getAgeRange(ageFilter);
      if (ageRange) {
        filtered = filtered.filter(student => 
          student.age >= ageRange.min && student.age <= ageRange.max
        );
      }
    }

    setFilteredStudents(filtered);
  };

  const getAgeRange = (ageGroup: string) => {
    switch (ageGroup) {
      case AgeGroup.NURSERY: return { min: 0, max: 2 };
      case AgeGroup.TODDLERS: return { min: 3, max: 4 };
      case AgeGroup.KINDERGARTEN: return { min: 5, max: 6 };
      case AgeGroup.PRIMARY: return { min: 7, max: 9 };
      case AgeGroup.JUNIOR: return { min: 10, max: 12 };
      case AgeGroup.YOUTH: return { min: 13, max: 17 };
      case AgeGroup.ADULT: return { min: 18, max: 100 };
      default: return null;
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/students`);
  };

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      // Check if adding this student would exceed capacity
      const currentEnrolled = enrolledStudents.length;
      const currentSelected = newSelected.size;
      const maxStudents = classData?.maxStudents || 0;
      
      if (currentEnrolled + currentSelected + 1 > maxStudents) {
        toast.error(`Cannot add more students. Class capacity is ${maxStudents}.`);
        return;
      }
      
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const currentEnrolled = enrolledStudents.length;
    const maxStudents = classData?.maxStudents || 0;
    const availableSpots = maxStudents - currentEnrolled;
    
    if (filteredStudents.length > availableSpots) {
      toast.error(`Can only add ${availableSpots} more students due to capacity limit.`);
      const studentsToSelect = filteredStudents.slice(0, availableSpots);
      setSelectedStudents(new Set(studentsToSelect.map(s => s.id)));
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedStudents(new Set());
  };

  const handleAddStudents = async () => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student to add');
      return;
    }

    setAdding(true);
    
    try {
      const studentIds = Array.from(selectedStudents);
      // Add students one by one since the service method handles single students
      const responses = await Promise.all(
        studentIds.map(studentId => sundaySchoolService.addStudentToClass(classId, studentId))
      );
      
      const successCount = responses.filter(r => r.success).length;
      const response = { success: successCount > 0, message: `${successCount} student(s) added successfully` };
      
      if (response.success) {
        toast.success(`${selectedStudents.size} student(s) added to class successfully`);
        router.push(`/dashboard/sunday-school/classes/${classId}/students`);
      } else {
        toast.error(response.message || 'Failed to add students');
      }
    } catch (error) {
      toast.error('Failed to add students');
    } finally {
      setAdding(false);
    }
  };

  const getRemainingCapacity = () => {
    if (!classData) return 0;
    return classData.maxStudents - enrolledStudents.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
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
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Students</h1>
              <p className="text-muted-foreground">
                Add students to {classData?.name}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddStudents}
            disabled={selectedStudents.size === 0 || adding}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {adding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Class Info & Capacity */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              students enrolled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Capacity</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRemainingCapacity()}</div>
            <p className="text-xs text-muted-foreground">
              spots available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Students</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              matching criteria
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedStudents.size}</div>
            <p className="text-xs text-muted-foreground">
              to be added
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find Students</CardTitle>
          <CardDescription>
            Search and filter available students to add to the class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, parent name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                {Object.values(AgeGroup).map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {filteredStudents.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {filteredStudents.length} students available
                </span>
                {selectedStudents.size > 0 && (
                  <Badge variant="secondary">
                    {selectedStudents.size} selected
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={selectedStudents.size === filteredStudents.length}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeselectAll}
                  disabled={selectedStudents.size === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          )}

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              {availableStudents.length === 0 ? (
                <>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All students are enrolled</h3>
                  <p className="text-muted-foreground">
                    There are no more students available to add to this class
                  </p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No students found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.has(student.id);
                const canSelect = isSelected || getRemainingCapacity() > selectedStudents.size;
                
                return (
                  <div 
                    key={student.id} 
                    className={`flex items-center space-x-4 p-4 border rounded-lg transition-colors ${
                      isSelected 
                        ? 'border-brand-primary bg-brand-primary/5' 
                        : canSelect 
                          ? 'hover:bg-muted cursor-pointer' 
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect && handleStudentToggle(student.id)}
                  >
                    <Checkbox 
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={() => canSelect && handleStudentToggle(student.id)}
                    />
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{student.name}</h4>
                        <Badge variant="outline">Age {student.age}</Badge>
                        {!canSelect && !isSelected && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Capacity Full
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Born {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{student.parentContact.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{student.parentContact.phone}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Parent:</span>
                        <span className="text-sm font-medium">{student.parentContact.parentName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}