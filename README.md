# Church Management System - Frontend

A modern, responsive church management system built with Next.js, TypeScript, and Tailwind CSS. This system provides comprehensive tools for managing church members, finances, events, communications, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emc-church-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=ChurchMS
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Email**: `admin@church.com`
- **Password**: `password123`

## 📁 Project Structure

```
emc-church-system/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── members/      # Members management
│   │   ├── finance/      # Financial management
│   │   ├── events/       # Events management
│   │   ├── attendance/   # Attendance tracking
│   │   ├── communications/ # Communications
│   │   ├── groups/       # Groups management
│   │   ├── sunday-school/ # Sunday School
│   │   ├── prayer-requests/ # Prayer requests
│   │   ├── analytics/    # Analytics & reports
│   │   └── settings/     # System settings
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   ├── ui/              # UI components (shadcn/ui)
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── theme/           # Theme components
├── services/             # API service layer
│   ├── api-client.ts    # Base API client
│   ├── auth-service.ts  # Authentication service
│   ├── members-service.ts # Members service
│   ├── finance-service.ts # Finance service
│   └── ...              # Other services
├── lib/                  # Utilities and configurations
│   ├── contexts/        # React contexts
│   ├── types.ts         # TypeScript types
│   ├── utils.ts         # Utility functions
│   └── permissions.ts   # Permission definitions
├── hooks/               # Custom React hooks
├── types/               # TypeScript interfaces
└── public/              # Static assets
```

## 🛠 Technology Stack

### Core Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library

### State Management
- **React Context** - Global state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### API Integration
- **Axios** - HTTP client for API calls
- **React Query** - Server state management (planned)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=ChurchMS
NEXT_PUBLIC_APP_VERSION=1.0.0

# External Services (Optional)
NEXT_PUBLIC_SMS_SERVICE_URL=
NEXT_PUBLIC_EMAIL_SERVICE_URL=
NEXT_PUBLIC_FILE_UPLOAD_URL=
```

### API Endpoints

The frontend expects the following API structure:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

#### Members
- `GET /api/members` - Get all members (with pagination)
- `POST /api/members` - Create new member
- `GET /api/members/:id` - Get member by ID
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

#### Finance
- `GET /api/finance/donations` - Get donations
- `POST /api/finance/donations` - Create donation
- `GET /api/finance/budgets` - Get budgets
- `POST /api/finance/budgets` - Create budget

#### Events
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event

## 🎨 Component Architecture

### Reusable Components

#### Data Table Component
```typescript
import { DataTable } from '@/components/ui/data-table';

<DataTable
  data={members}
  columns={memberColumns}
  searchable
  sortable
  pagination
  onRowClick={(member) => router.push(`/dashboard/members/${member.id}`)}
/>
```

#### Form Input Component
```typescript
import { FormInput } from '@/components/ui/form-input';

<FormInput
  name="firstName"
  label="First Name"
  placeholder="Enter first name"
  validation={{ required: "First name is required" }}
/>
```

#### Modal Component
```typescript
import { Modal } from '@/components/ui/modal';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Add New Member"
>
  <MemberForm onSubmit={handleSubmit} />
</Modal>
```

## 🔌 API Integration

### Service Layer Pattern

All API calls are organized in service classes:

```typescript
// services/members-service.ts
import apiClient from './api-client';

class MembersService {
  async getMembers(params: SearchParams): Promise<MembersResponse> {
    const response = await apiClient.get('/members', { params });
    return response.data;
  }
  
  async createMember(data: MemberFormData): Promise<MemberResponse> {
    const response = await apiClient.post('/members', data);
    return response.data;
  }
}

export default new MembersService();
```

### Error Handling

The API client includes automatic error handling:

- **401 Unauthorized**: Redirects to login
- **403 Forbidden**: Shows access denied message
- **500 Server Error**: Shows generic error message

### Authentication

JWT tokens are automatically included in requests:

```typescript
// Automatically adds Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🎯 State Management

### Context Providers

The app uses React Context for global state:

```typescript
// lib/contexts/auth-context.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth methods...
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Currency Management

Global currency state with localStorage persistence:

```typescript
// lib/contexts/currency-context.tsx
export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  
  // Currency methods...
  
  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}
```

## 🔐 Permission System

Role-based access control is implemented:

```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  VIEW_MEMBERS: 'canViewMembers',
  EDIT_MEMBERS: 'canEditMembers',
  VIEW_FINANCE: 'canViewFinance',
  MANAGE_FINANCE: 'canManageFinance',
  // ... more permissions
};

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [PERMISSIONS.VIEW_MEMBERS, PERMISSIONS.EDIT_MEMBERS],
  // ... role definitions
};
```

## 📱 Responsive Design

The application is built with mobile-first responsive design:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Responsive Patterns

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content adapts to screen size */}
</div>

// Conditional rendering
<div className="hidden md:block">
  {/* Desktop-only content */}
</div>
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
__tests__/
├── components/     # Component tests
├── pages/         # Page tests
├── services/      # Service tests
└── utils/         # Utility tests
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Setup

1. Set production environment variables
2. Configure API endpoints
3. Set up CDN for static assets
4. Configure monitoring and analytics

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (for containerized deployment)

## 📚 Documentation

### API Documentation

The backend team should provide:

1. **OpenAPI/Swagger specification**
2. **Authentication flow documentation**
3. **Error response formats**
4. **Rate limiting information**

### Component Documentation

- **Storybook** integration for component documentation
- **Props documentation** for each component
- **Usage examples** and best practices

## 🔄 Development Workflow

### Git Workflow

1. **Feature branches**: Create from `main`
2. **Pull requests**: Required for all changes
3. **Code review**: Mandatory before merge
4. **Semantic commits**: Use conventional commit format

### Code Standards

- **ESLint**: Enforced code quality
- **Prettier**: Consistent formatting
- **TypeScript**: Strict type checking
- **Husky**: Pre-commit hooks

## 🤝 Backend Integration

### API Contract

The frontend expects the following response format:

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Integration Points

1. **Authentication**: JWT token-based auth
2. **File Upload**: Multipart form data
3. **Real-time**: WebSocket connections (planned)
4. **Notifications**: Push notifications (planned)

## 📈 Performance Optimization

### Implemented Optimizations

- **Code splitting**: Automatic with Next.js
- **Image optimization**: Next.js Image component
- **Lazy loading**: Component-level lazy loading
- **Caching**: Browser and CDN caching

### Planned Optimizations

- **React Query**: Server state caching
- **Service Workers**: Offline support
- **Bundle analysis**: Webpack bundle analyzer
- **Performance monitoring**: Real User Monitoring

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify backend server is running
   - Check CORS configuration

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Styling Issues**
   - Verify Tailwind CSS configuration
   - Check for CSS conflicts
   - Ensure proper class names

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

## 📞 Support

For issues and questions:

1. **Check existing issues** in the repository
2. **Create new issue** with detailed description
3. **Contact development team** for urgent matters

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ for the EMC** 