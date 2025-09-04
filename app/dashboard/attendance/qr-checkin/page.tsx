'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  UserCheck, 
  Clock, 
  Smartphone,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceService } from '@/services/attendance-service';
import { ServiceType, AttendanceStatus } from '@/lib/types';



// Mock QR session data
const MOCK_QR_SESSION = {
  id: 'qr_session_001',
  serviceType: 'Sunday Service',
  serviceDate: new Date().toISOString().split('T')[0],
  location: 'Main Auditorium',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=checkin_session_001',
  checkInUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin/qr_session_001`,
  isActive: true,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
  stats: {
    totalCheckedIn: 127,
    recentCheckins: 8,
    expectedAttendees: 450
  }
};

// Mock recent check-ins
const MOCK_RECENT_CHECKINS = [
  {
    id: 'checkin_001',
    memberName: 'John Doe',
    checkInTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'checkin_002',
    memberName: 'Jane Smith',
    checkInTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'checkin_003',
    memberName: 'Michael Johnson',
    checkInTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    status: AttendanceStatus.LATE
  },
  {
    id: 'checkin_004',
    memberName: 'Sarah Wilson',
    checkInTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
    status: AttendanceStatus.PRESENT
  }
];

export default function QRCheckinPage() {
  const router = useRouter();
  const [qrSession, setQrSession] = useState(MOCK_QR_SESSION);
  const [recentCheckins, setRecentCheckins] = useState(MOCK_RECENT_CHECKINS);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedService, setSelectedService] = useState('Sunday Service');
  const [selectedLocation, setSelectedLocation] = useState('Main Auditorium');

  // Auto-refresh recent check-ins every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch fresh data
      // For now, we'll simulate new check-ins
      if (Math.random() > 0.7) {
        const newCheckin = {
          id: `checkin_${Date.now()}`,
          memberName: `Member ${Math.floor(Math.random() * 100)}`,
          checkInTime: new Date().toISOString(),
          status: Math.random() > 0.8 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
        };
        setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 9)]); // Keep only 10 recent
        setQrSession(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            totalCheckedIn: prev.stats.totalCheckedIn + 1,
            recentCheckins: prev.stats.recentCheckins + 1
          }
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleGenerateNewQR = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate new QR session
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSessionId = `qr_session_${Date.now()}`;
      const newSession = {
        ...qrSession,
        id: newSessionId,
        serviceType: selectedService,
        location: selectedLocation,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=checkin_${newSessionId}`,
        checkInUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin/${newSessionId}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalCheckedIn: 0,
          recentCheckins: 0,
          expectedAttendees: 450
        }
      };
      
      setQrSession(newSession);
      setRecentCheckins([]);
      toast.success('New QR check-in session created successfully!');
    } catch (error) {
      toast.error('Failed to generate new QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrSession.checkInUrl);
    toast.success('Check-in URL copied to clipboard!');
  };

  const handleShareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Church Attendance Check-in',
        text: `Check in for ${qrSession.serviceType} at ${qrSession.location}`,
        url: qrSession.checkInUrl
      });
    } else {
      handleCopyUrl();
    }
  };

  const attendanceRate = Math.round((qrSession.stats.totalCheckedIn / qrSession.stats.expectedAttendees) * 100);
  const timeRemaining = Math.max(0, new Date(qrSession.expiresAt).getTime() - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Check-in</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage QR codes for quick attendance check-in
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateNewQR}
            disabled={isGenerating}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            Generate New QR
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{qrSession.stats.totalCheckedIn}</div>
            <p className="text-xs text-muted-foreground">
              of {qrSession.stats.expectedAttendees} expected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Users className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">{attendanceRate}%</div>
            <Progress value={attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{qrSession.stats.recentCheckins}</div>
            <p className="text-xs text-muted-foreground">
              in the last 10 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Expires</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {hoursRemaining}h {minutesRemaining}m
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(qrSession.expiresAt), 'MMM dd, HH:mm')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-brand-primary" />
              QR Code for Check-in
            </CardTitle>
            <CardDescription>
              Members can scan this QR code to check in quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                    <SelectItem value="Bible Study">Bible Study</SelectItem>
                    <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                    <SelectItem value="Youth Service">Youth Service</SelectItem>
                    <SelectItem value="Special Event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Auditorium">Main Auditorium</SelectItem>
                    <SelectItem value="Fellowship Hall">Fellowship Hall</SelectItem>
                    <SelectItem value="Youth Center">Youth Center</SelectItem>
                    <SelectItem value="Prayer Room">Prayer Room</SelectItem>
                    <SelectItem value="Outdoor Pavilion">Outdoor Pavilion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img 
                  src={qrSession.qrCode} 
                  alt="QR Code for Check-in" 
                  className="w-64 h-64"
                />
              </div>
              
              {/* Session Info */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active Session
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {qrSession.serviceType} • {qrSession.location}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {format(new Date(qrSession.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareQR}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(qrSession.qrCode, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-brand-primary" />
              Recent Check-ins
            </CardTitle>
            <CardDescription>
              Live feed of members checking in via QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No check-ins yet</p>
                  <p className="text-sm">Members will appear here as they scan the QR code</p>
                </div>
              ) : (
                recentCheckins.map((checkin) => {
                  const timeAgo = Math.floor((Date.now() - new Date(checkin.checkInTime).getTime()) / (1000 * 60));
                  return (
                    <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-primary">
                            {checkin.memberName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{checkin.memberName}</div>
                          <div className="text-xs text-muted-foreground">
                            {timeAgo === 0 ? 'Just now' : `${timeAgo} min ago`}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={checkin.status === AttendanceStatus.PRESENT 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {checkin.status === AttendanceStatus.PRESENT ? 'On Time' : 'Late'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use QR Check-in</CardTitle>
          <CardDescription>
            Instructions for members and administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">For Members:</h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Open your phone's camera app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>Point the camera at the QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>Tap the notification that appears</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">4</span>
                  <span>Complete the check-in form</span>
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-brand-primary">For Administrators:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Display the QR code prominently at the entrance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Monitor real-time check-ins on this dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Generate new QR codes for different services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Share the check-in URL via messaging apps</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}