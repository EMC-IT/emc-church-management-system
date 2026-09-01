'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Heart,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Search,
  Plus,
  ArrowRight,
  User,
  Calendar,
  Building2,
  UsersRound,
  MapPin,
  HandCoins,
  CheckCircle2,
  Lock,
  ExternalLink,
  MessageSquare,
  FileText,
  Shield,
  Activity,
} from 'lucide-react';

export type PastoralPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type PastoralStatus = 'New' | 'Assigned' | 'In Progress' | 'Follow-up Required' | 'Resolved' | 'Closed';
export type PastoralCategory =
  | 'Prayer Request'
  | 'New Convert'
  | 'First-Time Visitor'
  | 'Visitation'
  | 'Counseling'
  | 'Welfare & Support'
  | 'Attendance Concern';

export interface PastoralActivity {
  id: string;
  timestamp: string;
  author: string;
  action: string;
}

export interface MemberProfileFull {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone: string;
  email: string;
  address: string;
  membershipStatus: string;
  dateJoined: string;
  department: string;
  group: string;
  attendance: {
    rate: string;
    lastAttended: string;
    missedConsecutive: number;
    recentServices: { date: string; service: string; status: 'Present' | 'Absent' | string }[];
  };
  giving: {
    ytdTotal: string;
    lastGift: string;
    lastGiftDate: string;
  };
  prayerRequests: { id: string; title: string; date: string; status: string }[];
  pastoralHistory: { id: string; type: string; title: string; pastor: string; date: string; status: string }[];
  historicalNotes: { id: string; author: string; date: string; note: string }[];
}

export interface PastoralCase {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberEmail?: string;
  membershipStatus: 'Full Member' | 'New Convert' | 'Visitor' | 'Inactive';
  department?: string;
  title: string;
  description: string;
  category: PastoralCategory;
  priority: PastoralPriority;
  status: PastoralStatus;
  assignedTo: string;
  submittedBy: string;
  createdAt: string;
  dueDate?: string;
  nextFollowUpDate?: string;
  isConfidential: boolean;
  activities: PastoralActivity[];
  pastoralNotes: { id: string; author: string; date: string; content: string }[];
  profile: MemberProfileFull;
}

const initialCases: PastoralCase[] = [
  {
    id: 'pc_001',
    memberId: 'm_101',
    memberName: 'Elder Kofi Boateng',
    memberPhone: '+233 24 456 7890',
    memberEmail: 'kofi.boateng@church.org',
    membershipStatus: 'Full Member',
    department: 'Eldership Council',
    title: 'Hospital visitation requested following surgery',
    description: 'Elder Boateng underwent surgery at Ridge Hospital. Family requested hospital visitation and prayer for recovery.',
    category: 'Visitation',
    priority: 'Critical',
    status: 'In Progress',
    assignedTo: 'Pastor Michael',
    submittedBy: 'Grace Boateng (Wife)',
    createdAt: 'Today, 8:30 AM',
    dueDate: 'Today, 3:00 PM',
    nextFollowUpDate: '2026-09-03',
    isConfidential: false,
    activities: [
      { id: 'act_1', timestamp: 'Today — 9:15 AM', author: 'Pastor Michael', action: 'Assigned to case.' },
      { id: 'act_2', timestamp: 'Today — 9:32 AM', author: 'Pastor Michael', action: 'Called member family to confirm ward and visiting hours.' },
      { id: 'act_3', timestamp: 'Today — 10:05 AM', author: 'Pastor Michael', action: 'Hospital visit scheduled for 3:00 PM.' },
    ],
    pastoralNotes: [
      {
        id: 'note_1',
        author: 'Pastor Michael',
        date: 'Today, 9:40 AM',
        content: 'Spoke with Mrs. Boateng. Surgery went well; doctor advises short 15-minute visits. Anointing oil and communion requested.',
      },
    ],
    profile: {
      id: 'm_101',
      fullName: 'Elder Kofi Boateng',
      phone: '+233 24 456 7890',
      email: 'kofi.boateng@church.org',
      address: 'Plot 14, Airport Residential Area, Accra',
      membershipStatus: 'Full Member (Ordained Elder)',
      dateJoined: 'March 15, 2018',
      department: 'Eldership Council',
      group: 'Men of Honor Fellowship',
      attendance: {
        rate: '94%',
        lastAttended: 'Aug 24, 2026 (Sunday 1st Service)',
        missedConsecutive: 1,
        recentServices: [
          { date: 'Aug 24, 2026', service: 'Sunday 1st Service', status: 'Present' },
          { date: 'Aug 17, 2026', service: 'Sunday 1st Service', status: 'Present' },
          { date: 'Aug 10, 2026', service: 'Sunday 1st Service', status: 'Present' },
          { date: 'Aug 31, 2026', service: 'Sunday 1st Service', status: 'Absent' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 12,400.00',
        lastGift: 'GH₵ 1,200.00 (Tithe)',
        lastGiftDate: 'Aug 24, 2026',
      },
      prayerRequests: [
        { id: 'pr_1', title: 'Successful surgical procedure and speedy recovery', date: 'Aug 29, 2026', status: 'In Progress' },
        { id: 'pr_2', title: 'Grandchildren education and spiritual growth', date: 'May 12, 2026', status: 'Answered' },
      ],
      pastoralHistory: [
        { id: 'ph_1', type: 'Home Visitation', title: 'Pastoral family blessing', pastor: 'Pastor Michael', date: 'Jan 14, 2026', status: 'Completed' },
        { id: 'ph_2', type: 'Leadership Check-in', title: 'Annual council review', pastor: 'Pastor Daniel', date: 'Nov 02, 2025', status: 'Completed' },
      ],
      historicalNotes: [
        { id: 'hn_1', author: 'Pastor Michael', date: 'Jan 14, 2026', note: 'Family is spiritually strong. Elder Boateng leads weekly prayer vigil for the north zone.' },
      ],
    },
  },
  {
    id: 'pc_002',
    memberId: 'm_102',
    memberName: 'Samuel Kwaku Osei',
    memberPhone: '+233 24 555 0192',
    memberEmail: 'samuel.osei@gmail.com',
    membershipStatus: 'New Convert',
    department: 'Evangelism Follow-up',
    title: 'Salvation decision and baptism orientation follow-up',
    description: 'Gave life to Christ during last Sunday service. Needs initial discipleship contact and water baptism schedule.',
    category: 'New Convert',
    priority: 'High',
    status: 'New',
    assignedTo: 'Pastor Daniel',
    submittedBy: 'Altar Call Team',
    createdAt: 'Yesterday, 11:15 AM',
    dueDate: 'Today, 5:00 PM',
    nextFollowUpDate: '2026-09-05',
    isConfidential: false,
    activities: [
      { id: 'act_4', timestamp: 'Yesterday — 11:30 AM', author: 'System', action: 'New convert assimilation case created.' },
      { id: 'act_5', timestamp: 'Yesterday — 2:00 PM', author: 'Pastor Daniel', action: 'Assigned to New Believers Orientation.' },
    ],
    pastoralNotes: [
      {
        id: 'note_2',
        author: 'Pastor Daniel',
        date: 'Yesterday, 2:10 PM',
        content: 'Lives near East Legon. Wants to join Foundation Class starting next Saturday.',
      },
    ],
    profile: {
      id: 'm_102',
      fullName: 'Samuel Kwaku Osei',
      phone: '+233 24 555 0192',
      email: 'samuel.osei@gmail.com',
      address: 'East Legon, near ARS Junction, Accra',
      membershipStatus: 'New Convert',
      dateJoined: 'Aug 31, 2026',
      department: 'Evangelism Follow-up',
      group: 'New Believers Discipleship Class',
      attendance: {
        rate: '100%',
        lastAttended: 'Aug 31, 2026 (Sunday Service)',
        missedConsecutive: 0,
        recentServices: [
          { date: 'Aug 31, 2026', service: 'Sunday Service (Salvation)', status: 'Present' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 50.00',
        lastGift: 'GH₵ 50.00 (Offering)',
        lastGiftDate: 'Aug 31, 2026',
      },
      prayerRequests: [
        { id: 'pr_3', title: 'Spiritual grounding and baptism preparation', date: 'Aug 31, 2026', status: 'Pending' },
      ],
      pastoralHistory: [
        { id: 'ph_3', type: 'Altar Counseling', title: 'Salvation decision recorded', pastor: 'Pastor Daniel', date: 'Aug 31, 2026', status: 'Completed' },
      ],
      historicalNotes: [],
    },
  },
  {
    id: 'pc_003',
    memberId: 'm_103',
    memberName: 'John Mensah',
    memberPhone: '+233 20 888 1234',
    memberEmail: 'john.mensah@outlook.com',
    membershipStatus: 'Full Member',
    department: 'Men Fellowship',
    title: 'Attendance alert: Missed 4 consecutive Sundays',
    description: 'System detected zero attendance check-ins for the entire month of August. Previously regular in weekly attendance.',
    category: 'Attendance Concern',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'Pastor Daniel',
    submittedBy: 'Attendance System',
    createdAt: 'Today, 7:00 AM',
    dueDate: 'Tomorrow',
    nextFollowUpDate: '2026-09-04',
    isConfidential: false,
    activities: [
      { id: 'act_6', timestamp: 'Today — 7:00 AM', author: 'System', action: 'Triggered pastoral alert: 4 missed services.' },
      { id: 'act_7', timestamp: 'Today — 8:00 AM', author: 'Pastor Daniel', action: 'Assigned to pastoral care queue.' },
    ],
    pastoralNotes: [],
    profile: {
      id: 'm_103',
      fullName: 'John Mensah',
      phone: '+233 20 888 1234',
      email: 'john.mensah@outlook.com',
      address: 'Spintex Road, Baatsona, Accra',
      membershipStatus: 'Full Member (Inactive Risk)',
      dateJoined: 'June 10, 2022',
      department: 'Men Fellowship',
      group: 'Living Stones Cell Group',
      attendance: {
        rate: '40% (Drop)',
        lastAttended: 'July 27, 2026',
        missedConsecutive: 4,
        recentServices: [
          { date: 'Aug 31, 2026', service: 'Sunday Service', status: 'Absent' },
          { date: 'Aug 24, 2026', service: 'Sunday Service', status: 'Absent' },
          { date: 'Aug 17, 2026', service: 'Sunday Service', status: 'Absent' },
          { date: 'Aug 10, 2026', service: 'Sunday Service', status: 'Absent' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 1,800.00',
        lastGift: 'GH₵ 250.00 (Tithe)',
        lastGiftDate: 'July 27, 2026',
      },
      prayerRequests: [],
      pastoralHistory: [
        { id: 'ph_4', type: 'Pastoral Check-in', title: 'Cell leader touchpoint', pastor: 'Pastor Daniel', date: 'March 2026', status: 'Completed' },
      ],
      historicalNotes: [
        { id: 'hn_2', author: 'Pastor Daniel', date: 'March 2026', note: 'Started a new shift rotation job. May need flexible mid-week fellowship connection.' },
      ],
    },
  },
  {
    id: 'pc_004',
    memberId: 'm_104',
    memberName: 'Ama Owusu',
    memberPhone: '+233 27 123 9988',
    memberEmail: 'ama.owusu@yahoo.com',
    membershipStatus: 'Visitor',
    title: 'First-time visitor welcome call',
    description: 'Visited for the first time on Sunday. Indicated interest in joining the Church Choir ministry.',
    category: 'First-Time Visitor',
    priority: 'Medium',
    status: 'New',
    assignedTo: 'Unassigned',
    submittedBy: 'Reception Desk',
    createdAt: 'Yesterday, 12:40 PM',
    dueDate: 'Today, 6:00 PM',
    isConfidential: false,
    activities: [
      { id: 'act_8', timestamp: 'Yesterday — 12:40 PM', author: 'Reception Desk', action: 'Visitor card logged.' },
    ],
    pastoralNotes: [],
    profile: {
      id: 'm_104',
      fullName: 'Ama Owusu',
      phone: '+233 27 123 9988',
      email: 'ama.owusu@yahoo.com',
      address: 'Madina Zongo Junction, Accra',
      membershipStatus: 'First-Time Guest',
      dateJoined: 'Aug 31, 2026 (1st Visit)',
      department: 'Guest Integration',
      group: 'Choir Interest',
      attendance: {
        rate: '100%',
        lastAttended: 'Aug 31, 2026',
        missedConsecutive: 0,
        recentServices: [
          { date: 'Aug 31, 2026', service: 'Sunday 2nd Service', status: 'Present' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 20.00',
        lastGift: 'GH₵ 20.00 (Visitor Offering)',
        lastGiftDate: 'Aug 31, 2026',
      },
      prayerRequests: [],
      pastoralHistory: [],
      historicalNotes: [],
    },
  },
  {
    id: 'pc_005',
    memberId: 'm_105',
    memberName: 'Mary Annan',
    memberPhone: '+233 55 987 6543',
    memberEmail: 'mary.annan@church.org',
    membershipStatus: 'Full Member',
    department: 'Women Ministry',
    title: 'Marital counseling request',
    description: 'Pre-marital guidance and counseling session requested with lead pastor.',
    category: 'Counseling',
    priority: 'High',
    status: 'Follow-up Required',
    assignedTo: 'Pastor Grace',
    submittedBy: 'Mary Annan',
    createdAt: 'Aug 28, 2026',
    dueDate: 'Sep 4, 2026',
    nextFollowUpDate: '2026-09-06',
    isConfidential: true,
    activities: [
      { id: 'act_9', timestamp: 'Aug 28 — 2:30 PM', author: 'Pastor Grace', action: 'Initial counseling session held.' },
      { id: 'act_10', timestamp: 'Aug 30 — 11:00 AM', author: 'Pastor Grace', action: 'Study materials provided.' },
    ],
    pastoralNotes: [
      {
        id: 'note_3',
        author: 'Pastor Grace',
        date: 'Aug 30, 11:15 AM',
        content: 'Session 1 completed. Couples requested follow-up prayer on Saturday evening.',
      },
    ],
    profile: {
      id: 'm_105',
      fullName: 'Mary Annan',
      phone: '+233 55 987 6543',
      email: 'mary.annan@church.org',
      address: 'Osu RE, Accra',
      membershipStatus: 'Full Member',
      dateJoined: 'November 4, 2019',
      department: 'Women Ministry & Protocol',
      group: 'Deborah Women Circle',
      attendance: {
        rate: '91%',
        lastAttended: 'Aug 31, 2026',
        missedConsecutive: 0,
        recentServices: [
          { date: 'Aug 31, 2026', service: 'Sunday Service', status: 'Present' },
          { date: 'Aug 24, 2026', service: 'Sunday Service', status: 'Present' },
          { date: 'Aug 17, 2026', service: 'Sunday Service', status: 'Present' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 3,900.00',
        lastGift: 'GH₵ 400.00 (Tithe)',
        lastGiftDate: 'Aug 24, 2026',
      },
      prayerRequests: [
        { id: 'pr_5', title: 'Wedding preparation and divine provision', date: 'Aug 15, 2026', status: 'In Progress' },
      ],
      pastoralHistory: [
        { id: 'ph_5', type: 'Premarital Counseling', title: 'Session 1 - Foundation of Christian Marriage', pastor: 'Pastor Grace', date: 'Aug 28, 2026', status: 'Completed' },
      ],
      historicalNotes: [
        { id: 'hn_3', author: 'Pastor Grace', date: 'Aug 28, 2026', note: 'Wedding planned for December 2026. Pre-marital counseling syllabus modules 1 to 4 distributed.' },
      ],
    },
  },
  {
    id: 'pc_006',
    memberId: 'm_106',
    memberName: 'David Ofori',
    memberPhone: '+233 24 111 2233',
    memberEmail: 'david.ofori@church.org',
    membershipStatus: 'Full Member',
    department: 'Media & Tech',
    title: 'Bereavement support & funeral planning',
    description: 'Loss of member mother. Family requests pastoral presence and prayers.',
    category: 'Welfare & Support',
    priority: 'Critical',
    status: 'In Progress',
    assignedTo: 'Pastor Michael',
    submittedBy: 'David Ofori',
    createdAt: 'Aug 29, 2026',
    dueDate: 'Tomorrow',
    nextFollowUpDate: '2026-09-05',
    isConfidential: false,
    activities: [
      { id: 'act_11', timestamp: 'Aug 29 — 5:00 PM', author: 'Pastor Michael', action: 'Pastoral phone call and prayer held.' },
      { id: 'act_12', timestamp: 'Aug 30 — 4:00 PM', author: 'Pastor Michael', action: 'Welfare committee notified.' },
    ],
    pastoralNotes: [],
    profile: {
      id: 'm_106',
      fullName: 'David Ofori',
      phone: '+233 24 111 2233',
      email: 'david.ofori@church.org',
      address: 'Achimota Mile 7, Accra',
      membershipStatus: 'Full Member',
      dateJoined: 'February 20, 2020',
      department: 'Media & Tech Ministry',
      group: 'Kingdom Builders Group',
      attendance: {
        rate: '88%',
        lastAttended: 'Aug 24, 2026',
        missedConsecutive: 1,
        recentServices: [
          { date: 'Aug 31, 2026', service: 'Sunday Service', status: 'Absent' },
          { date: 'Aug 24, 2026', service: 'Sunday Service', status: 'Present' },
          { date: 'Aug 17, 2026', service: 'Sunday Service', status: 'Present' },
        ],
      },
      giving: {
        ytdTotal: 'GH₵ 5,200.00',
        lastGift: 'GH₵ 500.00 (Tithe)',
        lastGiftDate: 'Aug 24, 2026',
      },
      prayerRequests: [
        { id: 'pr_6', title: 'Comfort and strength during family bereavement', date: 'Aug 29, 2026', status: 'In Progress' },
      ],
      pastoralHistory: [
        { id: 'ph_6', type: 'Welfare Touchpoint', title: 'Bereavement pastoral visit', pastor: 'Pastor Michael', date: 'Aug 30, 2026', status: 'Completed' },
      ],
      historicalNotes: [],
    },
  },
];

// Pre-populated existing church membership roster for quick lookup
const SYSTEM_MEMBERS = [
  {
    id: 'm_101',
    fullName: 'Elder Kofi Boateng',
    phone: '+233 24 456 7890',
    email: 'kofi.boateng@church.org',
    membershipStatus: 'Full Member (Ordained Elder)',
    department: 'Eldership Council',
    group: 'Men of Honor Fellowship',
    address: 'Airport Residential Area, Accra',
  },
  {
    id: 'm_102',
    fullName: 'Samuel Kwaku Osei',
    phone: '+233 24 555 0192',
    email: 'samuel.osei@gmail.com',
    membershipStatus: 'New Convert',
    department: 'Evangelism Follow-up',
    group: 'New Believers Discipleship Class',
    address: 'East Legon, Accra',
  },
  {
    id: 'm_103',
    fullName: 'John Mensah',
    phone: '+233 20 888 1234',
    email: 'john.mensah@outlook.com',
    membershipStatus: 'Full Member (Inactive Risk)',
    department: 'Men Fellowship',
    group: 'Living Stones Cell Group',
    address: 'Spintex Road, Accra',
  },
  {
    id: 'm_104',
    fullName: 'Ama Owusu',
    phone: '+233 27 123 9988',
    email: 'ama.owusu@yahoo.com',
    membershipStatus: 'First-Time Guest',
    department: 'Guest Integration',
    group: 'Choir Interest',
    address: 'Madina, Accra',
  },
  {
    id: 'm_105',
    fullName: 'Mary Annan',
    phone: '+233 55 987 6543',
    email: 'mary.annan@church.org',
    membershipStatus: 'Full Member',
    department: 'Women Ministry & Protocol',
    group: 'Deborah Women Circle',
    address: 'Osu RE, Accra',
  },
  {
    id: 'm_106',
    fullName: 'David Ofori',
    phone: '+233 24 111 2233',
    email: 'david.ofori@church.org',
    membershipStatus: 'Full Member',
    department: 'Media & Tech Ministry',
    group: 'Kingdom Builders Group',
    address: 'Achimota, Accra',
  },
  {
    id: 'm_107',
    fullName: 'Grace Boateng',
    phone: '+233 24 999 1122',
    email: 'grace.boateng@church.org',
    membershipStatus: 'Full Member',
    department: 'Women Ministry',
    group: 'Deborah Women Circle',
    address: 'Airport Residential Area, Accra',
  },
  {
    id: 'm_108',
    fullName: 'Daniel Appiah',
    phone: '+233 20 333 4455',
    email: 'daniel.appiah@church.org',
    membershipStatus: 'Full Member',
    department: 'Youth Ministry',
    group: 'Youth Fellowship',
    address: 'Cantonments, Accra',
  },
  {
    id: 'm_109',
    fullName: 'Abena Mensah',
    phone: '+233 27 555 7788',
    email: 'abena.mensah@church.org',
    membershipStatus: 'Full Member',
    department: 'Choir & Music',
    group: 'Worship Team',
    address: 'Tema Community 6',
  },
];

export default function PastoralCarePage() {
  const [cases, setCases] = useState<PastoralCase[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<PastoralCase | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [drawerTab, setDrawerTab] = useState<'case' | 'profile'>('case');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState<'all' | 'my' | 'unassigned'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [pastorFilter, setPastorFilter] = useState<string>('all');

  // Dialog, search and form validation state
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<typeof SYSTEM_MEMBERS[0] | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newCaseData, setNewCaseData] = useState({
    memberName: '',
    memberPhone: '',
    title: '',
    description: '',
    category: 'Prayer Request' as PastoralCategory,
    priority: 'High' as PastoralPriority,
    assignedTo: 'Pastor Michael',
    dueDate: '',
    isConfidential: false,
  });

  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteError, setNoteError] = useState('');

  // Filtered members for modal search picker
  const searchedMembers = SYSTEM_MEMBERS.filter((m) => {
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.department.toLowerCase().includes(q)
    );
  });

  const handleSelectMember = (member: typeof SYSTEM_MEMBERS[0]) => {
    setSelectedMember(member);
    setNewCaseData((prev) => ({
      ...prev,
      memberName: member.fullName,
      memberPhone: member.phone,
    }));
    setFormErrors((prev) => ({
      ...prev,
      memberName: '',
      memberPhone: '',
    }));
    setMemberSearchQuery('');
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setNewCaseData((prev) => ({
      ...prev,
      memberName: '',
      memberPhone: '',
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate member name
    const trimmedName = newCaseData.memberName.trim();
    if (!trimmedName) {
      errors.memberName = 'Please select an existing member or enter a member name';
    } else if (trimmedName.length < 2) {
      errors.memberName = 'Name must be at least 2 characters';
    }

    // Validate phone number if provided
    const trimmedPhone = newCaseData.memberPhone.trim();
    if (trimmedPhone) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        errors.memberPhone = 'Please enter a valid phone number (e.g. +233 24 000 0000)';
      }
    }

    // Validate case title
    const trimmedTitle = newCaseData.title.trim();
    if (!trimmedTitle) {
      errors.title = 'Case title is required';
    } else if (trimmedTitle.length < 4) {
      errors.title = 'Title must be at least 4 characters';
    }

    // Validate description length if provided
    if (newCaseData.description && newCaseData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please resolve the errors highlighted below.');
      return;
    }

    const created: PastoralCase = {
      id: `pc_${Date.now()}`,
      memberId: selectedMember ? selectedMember.id : `m_${Date.now()}`,
      memberName: newCaseData.memberName.trim(),
      memberPhone: newCaseData.memberPhone.trim() || '+233 24 000 0000',
      memberEmail: selectedMember ? selectedMember.email : `${newCaseData.memberName.toLowerCase().replace(/\s+/g, '.')}@church.org`,
      membershipStatus: selectedMember ? (selectedMember.membershipStatus.includes('New Convert') ? 'New Convert' : selectedMember.membershipStatus.includes('Guest') ? 'Visitor' : 'Full Member') : 'Full Member',
      department: selectedMember ? selectedMember.department : 'General Congregation',
      title: newCaseData.title.trim(),
      description: newCaseData.description.trim() || 'No additional details provided.',
      category: newCaseData.category,
      priority: newCaseData.priority,
      status: newCaseData.assignedTo !== 'Unassigned' ? 'Assigned' : 'New',
      assignedTo: newCaseData.assignedTo,
      submittedBy: 'Current User',
      createdAt: 'Just now',
      dueDate: newCaseData.dueDate.trim() || 'Pending',
      isConfidential: newCaseData.isConfidential,
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: 'Just now',
          author: 'Current User',
          action: 'Pastoral care case created.',
        },
      ],
      pastoralNotes: [],
      profile: {
        id: selectedMember ? selectedMember.id : `m_${Date.now()}`,
        fullName: newCaseData.memberName.trim(),
        phone: newCaseData.memberPhone.trim() || '+233 24 000 0000',
        email: selectedMember ? selectedMember.email : `${newCaseData.memberName.toLowerCase().replace(/\s+/g, '.')}@church.org`,
        address: selectedMember ? selectedMember.address : 'Accra, Ghana',
        membershipStatus: selectedMember ? selectedMember.membershipStatus : 'Full Member',
        dateJoined: '2026',
        department: selectedMember ? selectedMember.department : 'General Congregation',
        group: selectedMember ? selectedMember.group : 'Cell Fellowship',
        attendance: {
          rate: '90%',
          lastAttended: 'Recent Sunday',
          missedConsecutive: 0,
          recentServices: [],
        },
        giving: {
          ytdTotal: 'GH₵ 0.00',
          lastGift: '—',
          lastGiftDate: '—',
        },
        prayerRequests: [],
        pastoralHistory: [],
        historicalNotes: [],
      },
    };

    setCases([created, ...cases]);
    setNewCaseOpen(false);
    setSelectedMember(null);
    setIsManualEntry(false);
    setMemberSearchQuery('');
    setFormErrors({});
    setNewCaseData({
      memberName: '',
      memberPhone: '',
      title: '',
      description: '',
      category: 'Prayer Request',
      priority: 'High',
      assignedTo: 'Pastor Michael',
      dueDate: '',
      isConfidential: false,
    });
    toast.success(`Case created for ${created.memberName}`);
  };

  const handleAddNote = () => {
    if (!selectedCase) return;

    if (!newNoteContent.trim()) {
      setNoteError('Please write a note before submitting.');
      return;
    }
    setNoteError('');

    const note = {
      id: `note_${Date.now()}`,
      author: 'Current Pastor',
      date: 'Just now',
      content: newNoteContent.trim(),
    };

    const updated = {
      ...selectedCase,
      pastoralNotes: [note, ...selectedCase.pastoralNotes],
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: 'Just now',
          author: 'Current Pastor',
          action: 'Added pastoral note.',
        },
        ...selectedCase.activities,
      ],
    };

    setSelectedCase(updated);
    setCases(cases.map((c) => (c.id === updated.id ? updated : c)));
    setNewNoteContent('');
    toast.success('Note added.');
  };

  const handleUpdateStatus = (caseId: string, nextStatus: PastoralStatus) => {
    const updatedCases = cases.map((c) => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          status: nextStatus,
          activities: [
            {
              id: `act_${Date.now()}`,
              timestamp: 'Just now',
              author: 'Current Pastor',
              action: `Status changed to ${nextStatus}`,
            },
            ...c.activities,
          ],
        };
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated);
        }
        return updated;
      }
      return c;
    });

    setCases(updatedCases);
    toast.success(`Status updated to ${nextStatus}`);
  };

  const handleAssignPastor = (caseId: string, pastorName: string) => {
    const updatedCases = cases.map((c) => {
      if (c.id === caseId) {
        const updated = {
          ...c,
          assignedTo: pastorName,
          status: (c.status === 'New' ? 'Assigned' : c.status) as PastoralStatus,
          activities: [
            {
              id: `act_${Date.now()}`,
              timestamp: 'Just now',
              author: 'Current User',
              action: `Assigned to ${pastorName}`,
            },
            ...c.activities,
          ],
        };
        if (selectedCase?.id === caseId) {
          setSelectedCase(updated);
        }
        return updated;
      }
      return c;
    });

    setCases(updatedCases);
    toast.success(`Assigned to ${pastorName}`);
  };

  // Filter logic
  const filteredCases = cases.filter((item) => {
    if (activeTab === 'prayer' && item.category !== 'Prayer Request') return false;
    if (activeTab === 'followup' && item.category !== 'New Convert' && item.category !== 'First-Time Visitor') return false;
    if (activeTab === 'visitation' && item.category !== 'Visitation') return false;
    if (activeTab === 'counseling' && item.category !== 'Counseling') return false;
    if (activeTab === 'welfare' && item.category !== 'Welfare & Support') return false;
    if (activeTab === 'attendance' && item.category !== 'Attendance Concern') return false;

    if (filterScope === 'my' && !item.assignedTo.toLowerCase().includes('michael')) return false;
    if (filterScope === 'unassigned' && item.assignedTo !== 'Unassigned') return false;

    if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (priorityFilter !== 'all' && item.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (pastorFilter !== 'all' && item.assignedTo !== pastorFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.memberName.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchPhone = item.memberPhone.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchPhone) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Title & Action Bar (Standalone title per AGENTS.md) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Pastoral Care</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/prayer-requests">
              Prayer Requests
            </Link>
          </Button>

          <Dialog
            open={newCaseOpen}
            onOpenChange={(open) => {
              setNewCaseOpen(open);
              if (!open) {
                setFormErrors({});
                setSelectedMember(null);
                setIsManualEntry(false);
                setMemberSearchQuery('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>New Case</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px]">
              <DialogHeader>
                <DialogTitle>New Pastoral Care Case</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateCase} noValidate className="space-y-4 pt-1">
                {/* Member Selection Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase font-semibold text-muted-foreground">
                      Member <span className="text-destructive">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualEntry(!isManualEntry);
                        handleClearSelectedMember();
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {isManualEntry ? '← Search from church database' : '+ Enter manual / non-member'}
                    </button>
                  </div>

                  {!isManualEntry ? (
                    selectedMember ? (
                      /* Selected Member Card Chip */
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {selectedMember.fullName.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-foreground">{selectedMember.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {selectedMember.phone} • {selectedMember.department}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={handleClearSelectedMember}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      /* Member Search Picker */
                      <div className="space-y-1.5">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search existing member by name or phone..."
                            value={memberSearchQuery}
                            aria-invalid={!!formErrors.memberName}
                            className={`pl-8 h-9 text-xs ${formErrors.memberName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            onChange={(e) => {
                              setMemberSearchQuery(e.target.value);
                              if (formErrors.memberName) setFormErrors({ ...formErrors, memberName: '' });
                            }}
                          />
                        </div>

                        {formErrors.memberName && (
                          <p className="text-xs text-destructive font-medium">{formErrors.memberName}</p>
                        )}

                        {/* Search Results Dropdown List */}
                        <div className="max-h-36 overflow-y-auto rounded-md border border-border bg-card divide-y divide-border">
                          {searchedMembers.length === 0 ? (
                            <div className="p-3 text-center text-xs text-muted-foreground">
                              <span>No members found. </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsManualEntry(true);
                                  setNewCaseData((prev) => ({ ...prev, memberName: memberSearchQuery }));
                                }}
                                className="text-primary hover:underline font-medium ml-1"
                              >
                                Add &quot;{memberSearchQuery}&quot; manually
                              </button>
                            </div>
                          ) : (
                            searchedMembers.slice(0, 5).map((m) => (
                              <div
                                key={m.id}
                                onClick={() => handleSelectMember(m)}
                                className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer transition text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                      {m.fullName.split(' ').map((n) => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-semibold text-foreground">{m.fullName}</span>
                                    <span className="text-muted-foreground ml-1.5 text-[11px]">({m.phone})</span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-muted-foreground">{m.department}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    /* Manual Entry Fields */
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <div className="space-y-1">
                        <Label htmlFor="memberName" className="text-xs">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="memberName"
                          placeholder="e.g. Samuel K. Osei"
                          value={newCaseData.memberName}
                          aria-invalid={!!formErrors.memberName}
                          className={`h-8 text-xs ${formErrors.memberName ? 'border-destructive' : ''}`}
                          onChange={(e) => {
                            setNewCaseData({ ...newCaseData, memberName: e.target.value });
                            if (formErrors.memberName) setFormErrors({ ...formErrors, memberName: '' });
                          }}
                        />
                        {formErrors.memberName && (
                          <p className="text-xs text-destructive font-medium">{formErrors.memberName}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="memberPhone" className="text-xs">Phone Number</Label>
                        <Input
                          id="memberPhone"
                          placeholder="+233 24 000 0000"
                          value={newCaseData.memberPhone}
                          aria-invalid={!!formErrors.memberPhone}
                          className={`h-8 text-xs ${formErrors.memberPhone ? 'border-destructive' : ''}`}
                          onChange={(e) => {
                            setNewCaseData({ ...newCaseData, memberPhone: e.target.value });
                            if (formErrors.memberPhone) setFormErrors({ ...formErrors, memberPhone: '' });
                          }}
                        />
                        {formErrors.memberPhone && (
                          <p className="text-xs text-destructive font-medium">{formErrors.memberPhone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="caseTitle">
                    Case Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="caseTitle"
                    placeholder="e.g. Hospital visitation requested"
                    value={newCaseData.title}
                    aria-invalid={!!formErrors.title}
                    className={formErrors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                    onChange={(e) => {
                      setNewCaseData({ ...newCaseData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                    }}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-destructive font-medium">{formErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newCaseData.category}
                      onValueChange={(val: any) => setNewCaseData({ ...newCaseData, category: val })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visitation">Hospital & Home Visitation</SelectItem>
                        <SelectItem value="New Convert">New Convert Discipleship</SelectItem>
                        <SelectItem value="First-Time Visitor">First-Time Visitor Follow-up</SelectItem>
                        <SelectItem value="Prayer Request">Prayer Request</SelectItem>
                        <SelectItem value="Counseling">Counseling Session</SelectItem>
                        <SelectItem value="Welfare & Support">Welfare & Support</SelectItem>
                        <SelectItem value="Attendance Concern">Attendance Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newCaseData.priority}
                      onValueChange={(val: any) => setNewCaseData({ ...newCaseData, priority: val })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select
                      value={newCaseData.assignedTo}
                      onValueChange={(val: any) => setNewCaseData({ ...newCaseData, assignedTo: val })}
                    >
                      <SelectTrigger id="assignedTo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pastor Michael">Pastor Michael</SelectItem>
                        <SelectItem value="Pastor Daniel">Pastor Daniel</SelectItem>
                        <SelectItem value="Pastor Grace">Pastor Grace</SelectItem>
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dueDate">Target Date</Label>
                    <Input
                      id="dueDate"
                      placeholder="e.g. Today, 4:00 PM"
                      value={newCaseData.dueDate}
                      onChange={(e) => setNewCaseData({ ...newCaseData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Situation Details</Label>
                    <span className="text-[11px] text-muted-foreground">
                      {newCaseData.description.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Provide details or notes regarding this case..."
                    value={newCaseData.description}
                    maxLength={500}
                    className={formErrors.description ? 'border-destructive focus-visible:ring-destructive' : ''}
                    onChange={(e) => {
                      setNewCaseData({ ...newCaseData, description: e.target.value });
                      if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                    }}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-destructive font-medium">{formErrors.description}</p>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setNewCaseOpen(false);
                      setSelectedMember(null);
                      setIsManualEntry(false);
                      setMemberSearchQuery('');
                      setFormErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Case</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Needs Attention"
          value="18"
          icon={AlertCircle}
          trend={{ value: "Active cases", direction: "neutral" }}
        />
        <StatCard
          title="Urgent Cases"
          value="4"
          icon={Heart}
          trend={{ value: "Immediate action", direction: "neutral" }}
        />
        <StatCard
          title="Unassigned"
          value="6"
          icon={User}
          trend={{ value: "Awaiting assignment", direction: "neutral" }}
        />
        <StatCard
          title="Due Today"
          value="5"
          icon={Clock}
          trend={{ value: "Scheduled follow-ups", direction: "neutral" }}
        />
      </div>

      {/* 3. Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="prayer">Prayer Requests</TabsTrigger>
          <TabsTrigger value="followup">Follow-ups</TabsTrigger>
          <TabsTrigger value="visitation">Visitation</TabsTrigger>
          <TabsTrigger value="counseling">Counseling</TabsTrigger>
          <TabsTrigger value="welfare">Welfare</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Concerns</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 4. Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search member, situation, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <Button
              variant={filterScope === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setFilterScope('all')}
            >
              All
            </Button>
            <Button
              variant={filterScope === 'my' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setFilterScope('my')}
            >
              My Cases
            </Button>
            <Button
              variant={filterScope === 'unassigned' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setFilterScope('unassigned')}
            >
              Unassigned
            </Button>
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="follow-up required">Follow-up Due</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pastorFilter} onValueChange={setPastorFilter}>
            <SelectTrigger className="w-[135px] h-8 text-xs">
              <SelectValue placeholder="Pastor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pastors</SelectItem>
              <SelectItem value="Pastor Michael">Pastor Michael</SelectItem>
              <SelectItem value="Pastor Daniel">Pastor Daniel</SelectItem>
              <SelectItem value="Pastor Grace">Pastor Grace</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || pastorFilter !== 'all' || searchTerm || filterScope !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2 text-muted-foreground"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setPastorFilter('all');
                setSearchTerm('');
                setFilterScope('all');
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 5. Main Cases Table */}
      <Card className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Situation / Summary</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-medium">No pastoral cases found.</p>
                    <p className="text-xs mt-1">Try clearing filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const statusVariantMap: Record<PastoralStatus, "primary" | "neutral" | "warning" | "success"> = {
                    New: 'primary',
                    Assigned: 'neutral',
                    'In Progress': 'primary',
                    'Follow-up Required': 'warning',
                    Resolved: 'neutral',
                    Closed: 'neutral',
                  };

                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setSelectedCase(c);
                        setDrawerTab('case');
                      }}
                      className="hover:bg-accent/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${c.priority === 'Critical' ? 'text-destructive' :
                          c.priority === 'High' ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-foreground">{c.memberName}</p>
                        <p className="text-xs text-muted-foreground">{c.memberPhone}</p>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                        {c.category}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs text-foreground font-medium">
                        {c.assignedTo}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs text-muted-foreground">
                        {c.dueDate || '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant={statusVariantMap[c.status]} size="sm">
                          {c.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(c);
                            setDrawerTab('case');
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. Case & Integrated Member Drawer Sheet */}
      <Sheet open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto p-6 space-y-5">
          {selectedCase && (
            <>
              {/* Header */}
              <SheetHeader className="space-y-1 pb-3 border-b border-border text-left">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{selectedCase.category}</span>
                  <span>{selectedCase.createdAt}</span>
                </div>
                <SheetTitle className="text-lg font-bold leading-snug">{selectedCase.title}</SheetTitle>
              </SheetHeader>

              {/* Integrated Switcher: Case Workflow vs Full Member Profile */}
              <div className="border-b border-border pb-1">
                <div className="flex gap-2">
                  <Button
                    variant={drawerTab === 'case' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setDrawerTab('case')}
                  >
                    Case Workflow
                  </Button>
                  <Button
                    variant={drawerTab === 'profile' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => setDrawerTab('profile')}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Member Profile</span>
                  </Button>
                </div>
              </div>

              {/* Tab 1: Case Workflow */}
              {drawerTab === 'case' && (
                <div className="space-y-5">
                  {/* Status and Assignment Control */}
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select
                        value={selectedCase.status}
                        onValueChange={(val: any) => handleUpdateStatus(selectedCase.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Assigned">Assigned</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Assigned Pastor</Label>
                      <Select
                        value={selectedCase.assignedTo}
                        onValueChange={(val) => handleAssignPastor(selectedCase.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pastor Michael">Pastor Michael</SelectItem>
                          <SelectItem value="Pastor Daniel">Pastor Daniel</SelectItem>
                          <SelectItem value="Pastor Grace">Pastor Grace</SelectItem>
                          <SelectItem value="Unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Compact Member Snapshot */}
                  <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {selectedCase.memberName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground text-sm">{selectedCase.memberName}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedCase.profile.membershipStatus}
                            {selectedCase.department && ` • ${selectedCase.department}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setDrawerTab('profile')}
                      >
                        View 360° Profile
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1.5"
                        onClick={() => toast.success(`Calling ${selectedCase.memberPhone}`)}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call ({selectedCase.memberPhone})</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        asChild
                      >
                        <Link href="/dashboard/communications/messages/new">
                          SMS
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Situation Description */}
                  <div className="space-y-1.5 pb-4 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Situation Details</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedCase.description}</p>
                  </div>

                  {/* Pastoral Notes */}
                  <div className="space-y-3 pb-4 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pastoral Notes</p>

                    <div className="space-y-2">
                      <Textarea
                        rows={2}
                        placeholder="Add pastoral note or observation..."
                        value={newNoteContent}
                        onChange={(e) => {
                          setNewNoteContent(e.target.value);
                          if (noteError) setNoteError('');
                        }}
                        className={`text-xs ${noteError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      {noteError && (
                        <p className="text-xs text-destructive font-medium">{noteError}</p>
                      )}
                      <div className="flex justify-end">
                        <Button size="sm" className="h-7 text-xs" onClick={handleAddNote}>
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {selectedCase.pastoralNotes.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {selectedCase.pastoralNotes.map((n) => (
                          <div key={n.id} className="p-3 rounded-md bg-muted/40 text-xs space-y-1">
                            <div className="flex items-center justify-between font-medium text-foreground">
                              <span>{n.author}</span>
                              <span className="text-muted-foreground">{n.date}</span>
                            </div>
                            <p className="text-foreground">{n.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity History */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity History</p>
                    <div className="space-y-2 text-xs">
                      {selectedCase.activities.map((act) => (
                        <div key={act.id} className="flex items-start justify-between text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">{act.author}: </span>
                            <span>{act.action}</span>
                          </div>
                          <span className="whitespace-nowrap ml-2 text-[11px]">{act.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleUpdateStatus(selectedCase.id, 'Follow-up Required')}
                    >
                      Schedule Follow-up
                    </Button>

                    <Button
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        handleUpdateStatus(selectedCase.id, 'Resolved');
                        toast.success(`Case resolved.`);
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 2: Integrated Member Profile View */}
              {drawerTab === 'profile' && (
                <div className="space-y-5">
                  {/* Personal & Church Information */}
                  <div className="space-y-3 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                          {selectedCase.profile.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground text-base">{selectedCase.profile.fullName}</p>
                        <p className="text-xs text-muted-foreground">{selectedCase.profile.membershipStatus}</p>
                        <p className="text-[11px] text-muted-foreground">Member since {selectedCase.profile.dateJoined}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">{selectedCase.profile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-foreground truncate">{selectedCase.profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-foreground">{selectedCase.profile.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UsersRound className="h-3.5 w-3.5" />
                        <span className="text-foreground">{selectedCase.profile.group}</span>
                      </div>
                      {selectedCase.profile.address && (
                        <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-foreground">{selectedCase.profile.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Health */}
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance Health</p>
                      <span className="text-xs font-semibold text-foreground">
                        Attendance Rate: {selectedCase.profile.attendance.rate}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Last Attended: <span className="text-foreground font-medium">{selectedCase.profile.attendance.lastAttended}</span>
                      {selectedCase.profile.attendance.missedConsecutive > 0 && (
                        <span className="text-destructive font-semibold ml-2">
                          ({selectedCase.profile.attendance.missedConsecutive} missed consecutive)
                        </span>
                      )}
                    </p>

                    {selectedCase.profile.attendance.recentServices.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {selectedCase.profile.attendance.recentServices.map((srv, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/40">
                            <span>{srv.date} — {srv.service}</span>
                            <span className={srv.status === 'Present' ? 'text-primary font-medium' : 'text-muted-foreground'}>
                              {srv.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Stewardship (Role Permitted) */}
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giving Snapshot</p>
                      <span className="text-[11px] text-muted-foreground">Pastoral Authorized</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground text-[11px]">YTD Giving Total</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{selectedCase.profile.giving.ytdTotal}</p>
                      </div>
                      <div className="p-2 rounded bg-muted/30">
                        <p className="text-muted-foreground text-[11px]">Last Contribution</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{selectedCase.profile.giving.lastGift}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedCase.profile.giving.lastGiftDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Prayer Requests History */}
                  <div className="space-y-2 pb-4 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prayer Requests</p>
                    {selectedCase.profile.prayerRequests.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No prior prayer requests logged.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedCase.profile.prayerRequests.map((pr) => (
                          <div key={pr.id} className="p-2 rounded bg-muted/40 text-xs flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{pr.title}</p>
                              <p className="text-[11px] text-muted-foreground">{pr.date}</p>
                            </div>
                            <Badge variant="neutral" size="sm">{pr.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous Pastoral Cases & Visitation History */}
                  <div className="space-y-2 pb-4 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pastoral Touchpoints & Visits</p>
                    {selectedCase.profile.pastoralHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No previous pastoral cases.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedCase.profile.pastoralHistory.map((ph) => (
                          <div key={ph.id} className="p-2 rounded bg-muted/40 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{ph.type}: {ph.title}</span>
                              <span className="text-[11px] text-muted-foreground">{ph.date}</span>
                            </div>
                            <p className="text-muted-foreground">Handled by: {ph.pastor} • {ph.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historical Pastoral Notes Archive */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historical Pastoral Notes</p>
                    {selectedCase.profile.historicalNotes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No archived notes on file.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCase.profile.historicalNotes.map((hn) => (
                          <div key={hn.id} className="p-2.5 rounded bg-muted/40 text-xs space-y-0.5">
                            <div className="flex items-center justify-between font-medium text-foreground">
                              <span>{hn.author}</span>
                              <span className="text-muted-foreground text-[11px]">{hn.date}</span>
                            </div>
                            <p className="text-foreground/90">{hn.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Return to case button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setDrawerTab('case')}
                    >
                      Back to Case Workflow
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
