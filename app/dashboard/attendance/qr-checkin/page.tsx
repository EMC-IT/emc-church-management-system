'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  UserCheck, 
  Clock, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Share2 
} from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceStatus } from '@/lib/types';

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
  expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
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
    checkInTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'checkin_002',
    memberName: 'Jane Smith',
    checkInTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'checkin_003',
    memberName: 'Michael Johnson',
    checkInTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: AttendanceStatus.LATE
  },
  {
    id: 'checkin_004',
    memberName: 'Sarah Wilson',
    checkInTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: AttendanceStatus.PRESENT
  }
];

export default function QRCheckinPage() {
  const router = useRouter();
  const [qrSession, setQrSession] = useState(MOCK_QR_SESSION);
  const [recentCheckins, setRecentCheckins] = useState(MOCK_RECENT_CHECKINS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedService, setSelectedService] = useState('Sunday Service');
  const [selectedLocation, setSelectedLocation] = useState('Main Auditorium');

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCheckin = {
          id: `checkin_${Date.now()}`,
          memberName: `Member ${Math.floor(Math.random() * 100)}`,
          checkInTime: new Date().toISOString(),
          status: Math.random() > 0.8 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
        };
        setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 9)]);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newSessionId = `qr_session_${Date.now()}`;
      setQrSession({
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
      });
      setRecentCheckins([]);
      toast.success('New QR check-in session generated');
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrSession.checkInUrl);
    toast.success('Check-in URL copied to clipboard');
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            QR Code Check-in
          </h1>
        </div>

        <Button
          onClick={handleGenerateNewQR}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <QrCode className="h-4 w-4 mr-1.5" />
          )}
          Generate New QR
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Checked In"
          value={qrSession.stats.totalCheckedIn}
          icon={UserCheck}
          description={`of ${qrSession.stats.expectedAttendees} expected`}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Users}
        />
        <StatCard
          title="Recent Check-ins"
          value={qrSession.stats.recentCheckins}
          icon={Clock}
          description="In the last 10 minutes"
        />
        <StatCard
          title="Session Expires In"
          value={`${hoursRemaining}h ${minutesRemaining}m`}
          icon={Clock}
          description={format(new Date(qrSession.expiresAt), 'MMM dd, HH:mm')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* QR Code Section */}
        <Card className="p-6 space-y-6">
          {/* Service Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-type">
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
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Auditorium">Main Auditorium</SelectItem>
                  <SelectItem value="Fellowship Hall">Fellowship Hall</SelectItem>
                  <SelectItem value="Youth Center">Youth Center</SelectItem>
                  <SelectItem value="Prayer Room">Prayer Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4 pt-2">
            <div className="bg-white p-4 rounded-lg border border-border">
              <img 
                src={qrSession.qrCode} 
                alt="QR Code for Check-in" 
                className="w-56 h-56"
              />
            </div>
            
            <div className="text-center space-y-1">
              <Badge variant="primary" size="sm">
                Active Session
              </Badge>
              <p className="text-sm font-medium text-foreground">
                {qrSession.serviceType} • {qrSession.location}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-1.5" />
                Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareQR}>
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(qrSession.qrCode, '_blank')}>
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Check-ins */}
        <Card className="p-6">
          <CardTitle className="text-base font-semibold mb-4">
            Recent Check-ins ({recentCheckins.length})
          </CardTitle>

          <div className="divide-y divide-border">
            {recentCheckins.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No check-ins yet. Members will appear as they scan the QR code.
              </div>
            ) : (
              recentCheckins.map((checkin) => {
                const timeAgo = Math.floor((Date.now() - new Date(checkin.checkInTime).getTime()) / (1000 * 60));
                return (
                  <div key={checkin.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {checkin.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{checkin.memberName}</div>
                        <div className="text-xs text-muted-foreground">
                          {timeAgo === 0 ? 'Just now' : `${timeAgo} min ago`}
                        </div>
                      </div>
                    </div>
                    <StatusBadge
                      status={checkin.status === AttendanceStatus.PRESENT ? 'present' : 'late'}
                      size="sm"
                    />
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-6">
        <CardTitle className="text-base font-semibold mb-4">
          How to Use QR Check-in
        </CardTitle>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">For Members</h4>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Open your mobile camera or barcode scanner</li>
              <li>Scan the displayed QR code</li>
              <li>Tap the check-in confirmation link</li>
              <li>Confirm attendance</li>
            </ol>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">For Administrators</h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Display the QR code on entrance screens or printouts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Monitor real-time arrivals in the check-ins table</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span>Export attendance records once the service concludes</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}