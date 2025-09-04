"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Department, Member } from "@/lib/types";
import { getDepartmentById } from "@/services/members-service";
import { ArrowLeft, Edit, Trash2, Users, Activity, BarChart3, Info, User } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ChartContainer } from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'Media Department',
    description: 'Handles all media, sound, and technical needs during services and events.',
    leader: 'Samuel Owusu',
    members: ['m1', 'm2', 'm3'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2023-06-15T12:00:00Z',
  },
  {
    id: '2',
    name: 'Music Department',
    description: 'Coordinates worship, choir, and music ministry activities.',
    leader: 'Abena Mensah',
    members: ['m4', 'm5', 'm6', 'm7'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-02-05T10:00:00Z',
    updatedAt: '2023-06-20T14:00:00Z',
  },
  {
    id: '3',
    name: 'Protocol Department',
    description: 'Ensures order, hospitality, and smooth flow of church services.',
    leader: 'Kwame Boateng',
    members: ['m8', 'm9'],
    departmentType: 'Administrative',
    status: 'Active',
    createdAt: '2023-03-12T11:00:00Z',
    updatedAt: '2023-06-25T16:00:00Z',
  },
  {
    id: '4',
    name: 'Children’s Ministry',
    description: 'Ministers to children and coordinates Sunday School activities.',
    leader: 'Esi Asare',
    members: ['m10', 'm11', 'm12', 'm13', 'm14'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-04-01T12:00:00Z',
    updatedAt: '2023-06-30T18:00:00Z',
  },
  {
    id: '5',
    name: 'Finance Department',
    description: 'Manages church finances, budgets, and financial reporting.',
    leader: 'Kojo Appiah',
    members: ['m15', 'm16'],
    departmentType: 'Administrative',
    status: 'Inactive',
    createdAt: '2023-05-10T13:00:00Z',
    updatedAt: '2023-07-05T20:00:00Z',
  },
];

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', firstName: 'John', lastName: 'Doe', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm2', firstName: 'Jane', lastName: 'Smith', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Female', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm3', firstName: 'Kwame', lastName: 'Boateng', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm4', firstName: 'Abena', lastName: 'Mensah', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Female', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm5', firstName: 'Kojo', lastName: 'Appiah', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
];

const MOCK_ACTIVITIES = [
  { id: 'a1', type: 'event', title: 'Media Training', date: '2024-01-10', description: 'Department media training session.' },
  { id: 'a2', type: 'service', title: 'Sunday Service', date: '2024-01-14', description: 'Handled sound and projection.' },
  { id: 'a3', type: 'meeting', title: 'Department Meeting', date: '2024-01-20', description: 'Monthly planning meeting.' },
];

// Mock analytics/statistics for departments
const mockDepartmentAnalytics = {
  totalMembers: 12,
  averageEngagement: 87,
  eventsOrganized: 8,
  attendanceRate: 92,
  genderDistribution: [
    { gender: 'Male', value: 7 },
    { gender: 'Female', value: 5 },
  ],
  memberGrowth: [
    { month: 'Jan', members: 8 },
    { month: 'Feb', members: 9 },
    { month: 'Mar', members: 10 },
    { month: 'Apr', members: 11 },
    { month: 'May', members: 12 },
  ],
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Load departments from localStorage if available
    let departments = JSON.parse(localStorage.getItem('departments') || 'null') || MOCK_DEPARTMENTS;
    const found = departments.find((d: Department) => d.id === id);
    setDepartment(found || null);
  }, [id]);

  const handleDelete = () => {
    let departments = JSON.parse(localStorage.getItem('departments') || 'null') || MOCK_DEPARTMENTS;
    departments = departments.filter((d: Department) => d.id !== id);
    localStorage.setItem('departments', JSON.stringify(departments));
    router.push('/dashboard/members/department');
  };

  if (!department) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-destructive text-lg font-semibold">Department not found</div>
      <Button asChild>
        <Link href="/dashboard/members/department">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
        </Link>
      </Button>
    </div>
  );

  // Get member objects for this department
  const assignedMembers = MOCK_MEMBERS.filter(m => department.members.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/members/department">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
            <p className="text-muted-foreground">View and manage department information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/dashboard/members/department/${department.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this department? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content: Two-column layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{department.name}</CardTitle>
            <CardDescription>{department.departmentType || 'Department'}</CardDescription>
            <Badge variant={department.status === 'Active' ? 'default' : 'secondary'} className="mt-2">
              {department.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Leader:</span> {department.leader}
              </div>
              <div className="flex items-center text-sm">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created:</span> {new Date(department.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Updated:</span> {new Date(department.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Members:</span> {department.members.length}
              </div>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground">
              {department.description}
            </div>
          </CardContent>
        </Card>

        {/* Detail Tabs Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Detailed department information and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Department Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{department.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{department.departmentType || 'Department'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={department.status === 'Active' ? 'default' : 'secondary'}>
                          {department.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leader:</span>
                        <span>{department.leader}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(department.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(department.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Description</h4>
                    <div className="text-sm text-muted-foreground">
                      {department.description}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {assignedMembers.length === 0 ? (
                    <div className="text-muted-foreground">No members assigned.</div>
                  ) : (
                    assignedMembers.map((member) => (
                      <Card key={member.id} className="flex flex-row items-center p-4 gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-muted-foreground">{member.email || 'No email'}</div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-4">
                <div className="space-y-2">
                  {MOCK_ACTIVITIES.length === 0 ? (
                    <div className="text-muted-foreground">No activities found.</div>
                  ) : (
                    MOCK_ACTIVITIES.map((activity) => (
                      <Card key={activity.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{activity.title}</div>
                            <div className="text-xs text-muted-foreground">{activity.date}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">{activity.description}</div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDepartmentAnalytics.totalMembers}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDepartmentAnalytics.averageEngagement}%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Events Organized</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDepartmentAnalytics.eventsOrganized}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockDepartmentAnalytics.attendanceRate}%</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Member Growth Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Member Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{ members: { color: '#2E8DB0', label: 'Members' } }}>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={mockDepartmentAnalytics.memberGrowth}>
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="members" fill="#2E8DB0" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  {/* Gender Distribution Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gender Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{ Male: { color: '#2E8DB0', label: 'Male' }, Female: { color: '#C49831', label: 'Female' } }}>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={mockDepartmentAnalytics.genderDistribution}
                              dataKey="value"
                              nameKey="gender"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              label
                            >
                              {mockDepartmentAnalytics.genderDistribution.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={idx === 0 ? '#2E8DB0' : '#C49831'} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 