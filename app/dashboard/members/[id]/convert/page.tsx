"use client";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Phone, User, MapPin, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const mockConvert = {
  id: '6',
  fullName: 'Emmanuel Owusu',
  contact1: '+233 24 999 8888',
  gender: 'Male',
  dateOfBirth: '2002-06-15',
  branch: 'Adenta (HQ)',
  serviceType: 'Empowerment',
  status: 'New', // Set status to New
  location: 'Accra',
};

// Add mock activity data
const mockActivities = [
  { id: '1', title: 'Attended Sunday Service', date: '2024-05-12' },
  { id: '2', title: 'Joined Empowerment Group', date: '2024-04-28' },
  { id: '3', title: 'Participated in Outreach', date: '2024-04-20' },
];

export default function ConvertProfilePage() {
  const router = useRouter();
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Convert Profile</h1>
          <p className="text-muted-foreground">View convert details and information</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Avatar and Main Info */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="flex flex-col items-center pb-0">
            <Avatar className="h-24 w-24 mb-2">
              <AvatarImage src={''} />
              <AvatarFallback>{mockConvert.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold mb-1 text-center">{mockConvert.fullName}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={mockConvert.status === 'New' ? 'success' : 'outline'}>{mockConvert.status}</Badge>
            </div>
            <Button size="sm" className="w-full" onClick={() => router.push(`/dashboard/members/${mockConvert.id}/convert/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Convert
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 mt-6">
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{mockConvert.contact1}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{mockConvert.gender}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{mockConvert.dateOfBirth}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{mockConvert.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Right: About and Activity */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Convert</CardTitle>
              <CardDescription>Short description or notes about this convert.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This is a placeholder for the convert's bio, background, or any important notes. You can update this section to include more details as needed.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and participation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockActivities.map(activity => (
                  <li key={activity.id} className="flex items-center justify-between text-sm">
                    <span>{activity.title}</span>
                    <span className="text-muted-foreground">{activity.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Service Type & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div><span className="font-medium">Service Type:</span> {mockConvert.serviceType}</div>
                <div><span className="font-medium">Status:</span> {mockConvert.status}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 