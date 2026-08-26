'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
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
  Mail,
  Phone,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student, AgeGroup } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const ageGroupOptions = Object.values(AgeGroup);

export default function AddStudentsToClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [classResponse, allStudentsResponse, enrolledResponse] = await Promise.all([
        sundaySchoolService.getClass(classId),
        sundaySchoolService.getStudents(),
        sundaySchoolService.getClassStudents(classId)
      ]);

      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      if (allStudentsResponse.success && allStudentsResponse.data) {
        setAllStudents(allStudentsResponse.data);
      }
      
      if (enrolledResponse.success && enrolledResponse.data) {
        setEnrolledStudents(enrolledResponse.data);
      }
    } catch {
      toast.error('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const enrolledIds = new Set(enrolledStudents.map(s => s.id));
    const available = allStudents.filter(student => !enrolledIds.has(student.id));
    setAvailableStudents(available);
  }, [allStudents, enrolledStudents]);

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      const maxStudents = classData?.maxStudents || 20;
      if (enrolledStudents.length + newSelected.size >= maxStudents) {
        toast.warning(`Cannot add more students. Class capacity is ${maxStudents}.`);
        return;
      }
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const maxStudents = classData?.maxStudents || 20;
    const remainingSpots = maxStudents - enrolledStudents.length;

    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const toSelect = filteredStudents.slice(0, remainingSpots).map(s => s.id);
      setSelectedStudents(new Set(toSelect));
      if (filteredStudents.length > remainingSpots) {
        toast.info(`Selected ${remainingSpots} students (class capacity limit).`);
      }
    }
  };

  const handleAddSelected = async () => {
    if (selectedStudents.size === 0) return;
    setAdding(true);
    try {
      const promises = Array.from(selectedStudents).map(studentId =>
        sundaySchoolService.addStudentToClass(classId, studentId)
      );
      await Promise.all(promises);
      toast.success(`Added ${selectedStudents.size} student(s) to class`);
      router.push(`/dashboard/sunday-school/classes/${classId}/students`);
    } catch {
      toast.error('Failed to add students to class');
    } finally {
      setAdding(false);
    }
  };

  const filteredStudents = availableStudents.filter(student => {
    const fullName = (student.name || '').toLowerCase();
    const parentName = student.parentContact?.parentName?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || parentName.includes(searchTerm.toLowerCase());
    const matchesAge = ageFilter === 'all' || student.age.toString() === ageFilter;
    return matchesSearch && matchesAge;
  });

  const maxCapacity = classData?.maxStudents || 20;
  const remainingSpots = Math.max(0, maxCapacity - enrolledStudents.length);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/sunday-school/classes/${classId}/students`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Add Students to Class</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enroll eligible students into {classData?.name || 'this Sunday school class'}.
            </p>
          </div>
        </div>

        <Button
          onClick={handleAddSelected}
          disabled={adding || selectedStudents.size === 0}
          className="w-full sm:w-auto"
        >
          {adding ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Add Selected ({selectedStudents.size})
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard title="Currently Enrolled" value={enrolledStudents.length} icon={Users} />
        <StatCard title="Remaining Spots" value={remainingSpots} icon={Users} />
        <StatCard title="Selected to Add" value={selectedStudents.size} icon={UserPlus} />
      </div>

      {/* Students Selection List */}
      <Card className="rounded-xl border border-border p-6">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Available Students</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filteredStudents.length} eligible students ready for enrollment</p>
            </div>
            {filteredStudents.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All Available'}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or guardian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((age) => (
                  <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.has(student.id);

              return (
                <div
                  key={student.id}
                  onClick={() => handleStudentToggle(student.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {student.name}
                        </span>
                        <Badge variant="neutral" size="sm">Age: {student.age}</Badge>
                      </div>
                      {student.parentContact?.parentName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Parent: {student.parentContact.parentName} {student.parentContact.phone ? `• ${student.parentContact.phone}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredStudents.length === 0 && (
              <p className="text-center py-12 text-sm text-muted-foreground">
                No available students match your search criteria.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}