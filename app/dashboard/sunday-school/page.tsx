'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Users, 
  BookOpen, 
  Calendar,
  MapPin,
  UserCheck,
  Download,
  QrCode,
  Eye,
  Edit
} from 'lucide-react';

const classes = [
  {
    id: '1',
    name: 'Little Lambs',
    ageGroup: '3-5 years',
    teacher: 'Sister Anna',
    schedule: 'Sundays 9:00 AM',
    room: 'Room A1',
    students: 15,
    maxStudents: 20,
    attendance: 85,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Young Disciples',
    ageGroup: '6-8 years',
    teacher: 'Brother Mark',
    schedule: 'Sundays 9:00 AM',
    room: 'Room A2',
    students: 22,
    maxStudents: 25,
    attendance: 90,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Faith Builders',
    ageGroup: '9-12 years',
    teacher: 'Sister Grace',
    schedule: 'Sundays 9:00 AM',
    room: 'Room B1',
    students: 18,
    maxStudents: 20,
    attendance: 88,
    status: 'Active',
  },
  {
    id: '4',
    name: 'Teen Warriors',
    ageGroup: '13-17 years',
    teacher: 'Pastor David',
    schedule: 'Sundays 9:00 AM',
    room: 'Youth Hall',
    students: 25,
    maxStudents: 30,
    attendance: 92,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Young Adults',
    ageGroup: '18-25 years',
    teacher: 'Elder Sarah',
    schedule: 'Sundays 11:30 AM',
    room: 'Conference Room',
    students: 20,
    maxStudents: 25,
    attendance: 80,
    status: 'Active',
  },
];

const recentAttendance = [
  { id: '1', className: 'Little Lambs', date: '2024-01-21', present: 12, absent: 3, late: 0 },
  { id: '2', className: 'Young Disciples', date: '2024-01-21', present: 20, absent: 2, late: 0 },
  { id: '3', className: 'Faith Builders', date: '2024-01-21', present: 16, absent: 2, late: 0 },
  { id: '4', className: 'Teen Warriors', date: '2024-01-21', present: 23, absent: 2, late: 0 },
  { id: '5', className: 'Young Adults', date: '2024-01-21', present: 16, absent: 4, late: 0 },
];

export default function SundaySchoolPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = ageFilter === 'all' || cls.ageGroup.includes(ageFilter);
    
    return matchesSearch && matchesAge;
  });

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0);
  const averageAttendance = Math.round(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length);
  const totalPresent = recentAttendance.reduce((sum, record) => sum + record.present, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sunday School</h1>
          <p className="text-muted-foreground">Manage Sunday School classes and student attendance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Generate Badges
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresent}</div>
            <p className="text-xs text-muted-foreground">Students present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>View and manage Sunday School classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-8">6-8 years</SelectItem>
                <SelectItem value="9-12">9-12 years</SelectItem>
                <SelectItem value="13-17">13-17 years</SelectItem>
                <SelectItem value="18-25">18-25 years</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Classes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant="outline">{cls.ageGroup}</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Students</span>
                      <span className="font-medium">{cls.students} / {cls.maxStudents}</span>
                    </div>
                    <Progress value={(cls.students / cls.maxStudents) * 100} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Attendance Rate</span>
                      <span className="font-medium text-green-600">{cls.attendance}%</span>
                    </div>
                    <Progress value={cls.attendance} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.schedule}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {cls.teacher.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{cls.teacher}</span>
                    </div>
                    
                    <Badge variant={cls.status === 'Active' ? 'default' : 'secondary'}>
                      {cls.status}
                    </Badge>
                  </div>
                  
                  <Button className="w-full" size="sm">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Take Attendance
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Latest attendance records for all classes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttendance.map((record) => {
                const total = record.present + record.absent + record.late;
                const rate = Math.round((record.present / total) * 100);
                
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.className}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-green-600 font-medium">{record.present}</TableCell>
                    <TableCell className="text-red-600">{record.absent}</TableCell>
                    <TableCell className="text-yellow-600">{record.late}</TableCell>
                    <TableCell>
                      <Badge variant={rate >= 90 ? 'default' : rate >= 75 ? 'secondary' : 'destructive'}>
                        {rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}