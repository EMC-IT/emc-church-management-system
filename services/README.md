# Services Layer Documentation

This directory contains all the API service classes for the church management system. Each service follows a consistent pattern and provides type-safe methods for interacting with the backend API.

## 📁 Service Structure

```
services/
├── api-client.ts          # Axios wrapper with interceptors
├── auth-service.ts        # Authentication API calls
├── members-service.ts     # Members CRUD operations
├── finance-service.ts     # Financial data operations
├── events-service.ts      # Events management
├── communications-service.ts # SMS/Email services
├── reports-service.ts     # Analytics and reporting
├── upload-service.ts      # File upload handling
└── index.ts              # Service exports
```

## 🔧 API Client

The `api-client.ts` provides a configured Axios instance with:

- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: Automatic JWT token inclusion in requests
- **Error Handling**: Automatic 401/403 response handling
- **Interceptors**: Request and response interceptors for common operations

### Usage

```typescript
import { apiClient } from '@/services';

// Direct API calls
const response = await apiClient.get('/some-endpoint');
```

## 🚀 Service Classes

### 1. AuthService (`auth-service.ts`)

Handles all authentication-related operations.

**Key Methods:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get current user info
- `refreshToken()` - Refresh JWT token
- `updateProfile(userData)` - Update user profile
- `changePassword(passwordData)` - Change password
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password

**Usage:**
```typescript
import { authService } from '@/services';

const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (loginResult.success) {
  // Handle successful login
  console.log(loginResult.data.user);
} else {
  // Handle error
  console.error(loginResult.message);
}
```

### 2. MembersService (`members-service.ts`)

Manages member data and operations.

**Key Methods:**
- `getMembers(params)` - Get paginated members list
- `getMember(id)` - Get single member
- `createMember(memberData)` - Create new member
- `updateMember(id, memberData)` - Update member
- `deleteMember(id)` - Delete member
- `uploadPhoto(id, file)` - Upload member photo
- `getMemberFamily(id)` - Get member's family
- `importMembers(file)` - Bulk import members
- `exportMembers(params)` - Export members data
- `getMemberStats()` - Get member statistics

**Usage:**
```typescript
import { membersService } from '@/services';

// Get members with filters
const members = await membersService.getMembers({
  page: 1,
  limit: 20,
  search: 'John',
  status: 'Active'
});

// Create new member
const newMember = await membersService.createMember({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  // ... other fields
});
```

### 3. FinanceService (`finance-service.ts`)

Handles financial operations including donations and budgets.

**Key Methods:**
- `getDonations(params)` - Get donations with filters
- `createDonation(donationData)` - Create donation
- `getBudgets()` - Get all budgets
- `createBudget(budgetData)` - Create budget
- `getFinancialReports()` - Get financial reports
- `getDonationStats()` - Get donation statistics
- `exportDonations(params)` - Export donations

**Usage:**
```typescript
import { financeService } from '@/services';

// Create donation
const donation = await financeService.createDonation({
  memberId: 'member-id',
  amount: 100.00,
  currency: 'GHS',
  donationType: 'Tithe',
  method: 'Cash',
  date: '2024-01-15'
});

// Get financial reports
const reports = await financeService.getFinancialReports(
  '2024-01-01',
  '2024-12-31'
);
```

### 4. EventsService (`events-service.ts`)

Manages events, registrations, and attendance.

**Key Methods:**
- `getEvents(params)` - Get events with filters
- `createEvent(eventData)` - Create event
- `getEventAttendees(eventId)` - Get event attendees
- `registerForEvent(registration)` - Register for event
- `markAttendance(attendance)` - Mark attendance
- `getEventStats()` - Get event statistics

**Usage:**
```typescript
import { eventsService } from '@/services';

// Create event
const event = await eventsService.createEvent({
  title: 'Sunday Service',
  description: 'Weekly Sunday service',
  date: '2024-01-21',
  time: '09:00',
  location: 'Main Auditorium',
  category: 'Service',
  organizer: 'Pastor John'
});

// Register for event
await eventsService.registerForEvent({
  eventId: 'event-id',
  memberId: 'member-id',
  status: 'confirmed'
});
```

### 5. CommunicationsService (`communications-service.ts`)

Handles SMS, email, and announcements.

**Key Methods:**
- `sendSMS(smsData)` - Send SMS message
- `sendEmail(emailData)` - Send email
- `getAnnouncements(params)` - Get announcements
- `createAnnouncement(announcementData)` - Create announcement
- `getTemplates(type)` - Get communication templates
- `getContactGroups()` - Get contact groups

**Usage:**
```typescript
import { communicationsService } from '@/services';

// Send SMS
await communicationsService.sendSMS({
  recipientIds: ['member-1', 'member-2'],
  message: 'Reminder: Sunday service at 9 AM'
});

// Create announcement
await communicationsService.createAnnouncement({
  title: 'Important Announcement',
  content: 'Church will be closed next Sunday',
  type: 'urgent',
  targetAudience: 'all',
  priority: 'high'
});
```

### 6. ReportsService (`reports-service.ts`)

Provides analytics and reporting functionality.

**Key Methods:**
- `getAnalyticsOverview()` - Get dashboard overview
- `getAttendanceReport(params)` - Get attendance reports
- `getGivingReport(params)` - Get giving reports
- `getMemberReport(params)` - Get member reports
- `getEventReport(params)` - Get event reports
- `exportAttendanceReport(params)` - Export reports

**Usage:**
```typescript
import { reportsService } from '@/services';

// Get analytics overview
const overview = await reportsService.getAnalyticsOverview();

// Get attendance report
const attendanceReport = await reportsService.getAttendanceReport({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  groupBy: 'month'
});
```

### 7. UploadService (`upload-service.ts`)

Handles file uploads with validation and progress tracking.

**Key Methods:**
- `uploadFile(file, category, onProgress)` - Upload single file
- `uploadFiles(files, category, onProgress)` - Upload multiple files
- `uploadLargeFile(file, category, onProgress)` - Upload large files in chunks
- `validateFile(file, config)` - Validate file before upload
- `getUploadedFiles(category)` - Get uploaded files

**Usage:**
```typescript
import { uploadService } from '@/services';

// Upload single file
const result = await uploadService.uploadFile(
  file,
  'members',
  (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
  }
);

// Validate file before upload
const validation = uploadService.validateFile(file, {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/*']
});
```

## 📊 Response Patterns

All services follow a consistent response pattern:

```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

**Success Response:**
```typescript
{
  success: true,
  data: { /* actual data */ },
  message: 'Operation completed successfully'
}
```

**Error Response:**
```typescript
{
  success: false,
  message: 'Error message',
  errors: ['Detailed error 1', 'Detailed error 2']
}
```

## 🔒 Error Handling

All services include comprehensive error handling:

1. **Network Errors**: Automatic retry logic
2. **Validation Errors**: Detailed error messages
3. **Authentication Errors**: Automatic token refresh/redirect
4. **Server Errors**: Graceful degradation

## 📝 Type Safety

All services are fully typed with TypeScript:

```typescript
// Import types
import { 
  DonationFormData, 
  EventFormData, 
  MemberFormData 
} from '@/services';

// Use in components
const handleSubmit = async (data: DonationFormData) => {
  const result = await financeService.createDonation(data);
  // TypeScript will ensure data matches DonationFormData
};
```

## 🚀 Best Practices

### 1. Service Usage in Components

```typescript
import { useState, useEffect } from 'react';
import { membersService } from '@/services';
import { useToast } from '@/hooks/use-toast';

export function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const result = await membersService.getMembers();
      
      if (result.success) {
        setMembers(result.data.data);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### 2. Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { membersService } from '@/services';
import { MemberFormData } from '@/services';

export function AddMemberForm() {
  const form = useForm<MemberFormData>();
  const { toast } = useToast();

  const onSubmit = async (data: MemberFormData) => {
    try {
      const result = await membersService.createMember(data);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Member created successfully'
        });
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create member',
        variant: 'destructive'
      });
    }
  };

  // ... form JSX
}
```

### 3. File Upload

```typescript
import { uploadService } from '@/services';

const handleFileUpload = async (file: File) => {
  // Validate file first
  const validation = uploadService.validateFile(file, {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*']
  });

  if (!validation.isValid) {
    toast({
      title: 'Invalid File',
      description: validation.errors.join(', '),
      variant: 'destructive'
    });
    return;
  }

  // Upload with progress
  const result = await uploadService.uploadFile(
    file,
    'members',
    (progress) => {
      console.log(`Upload: ${progress.percentage}%`);
    }
  );

  if (result.success) {
    toast({
      title: 'Success',
      description: 'File uploaded successfully'
    });
  }
};
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,application/pdf
```

### Service Configuration

```typescript
// Custom service configuration
const customConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/*'],
  retryAttempts: 3
};

const result = await uploadService.uploadFile(file, 'category', undefined, customConfig);
```

## 📚 Additional Resources

- [API Documentation](../API_DOCUMENTATION.md)
- [Frontend Roadmap](../FRONTEND_ROADMAP.md)
- [Type Definitions](../lib/types.ts)
- [Component Library](../components/ui/)

## 🤝 Contributing

When adding new services:

1. Follow the existing naming conventions
2. Include comprehensive TypeScript types
3. Add proper error handling
4. Include JSDoc comments
5. Update this README
6. Add tests for new functionality

## 📞 Support

For questions about the services layer, refer to:
- API Documentation
- Type definitions in `lib/types.ts`
- Example usage in components
- Cursor rules for development guidelines 