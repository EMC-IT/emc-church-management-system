# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing
```bash
# Run all tests (when implemented)
npm test

# Run tests in watch mode (when implemented)
npm run test:watch

# Run tests with coverage (when implemented)  
npm run test:coverage
```

### Common Development Tasks
```bash
# Run development server (starts on http://localhost:3000)
npm run dev

# Build the application
npm run build

# Format code with Prettier (if configured)
npx prettier --write .

# Type check TypeScript
npx tsc --noEmit
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context (AuthProvider, CurrencyProvider)
- **HTTP Client**: Axios with interceptors for auth
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Montserrat (Google Fonts)
- **Theme**: Dark/light mode with next-themes

### Project Structure
```
emc-church-system/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── members/      # Member management
│   │   ├── finance/      # Financial operations
│   │   ├── events/       # Event management
│   │   ├── attendance/   # Attendance tracking
│   │   ├── assets/       # Asset management
│   │   ├── analytics/    # Reports and analytics
│   │   └── ...          # Other modules
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Landing/login page
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── auth/             # Authentication components
│   └── theme/            # Theme components
├── services/             # API service layer
│   ├── api-client.ts     # Axios instance with interceptors
│   ├── auth-service.ts   # Authentication API calls
│   ├── members-service.ts # Member operations
│   ├── finance-service.ts # Financial operations
│   └── ...               # Other service modules
├── lib/                  # Utilities and configurations
│   ├── contexts/         # React contexts
│   ├── types.ts          # Global TypeScript types
│   ├── utils.ts          # Utility functions
│   └── permissions.ts    # Permission definitions
└── hooks/                # Custom React hooks
```

### Key Architectural Patterns

#### Service Layer Pattern
All API interactions are centralized in service classes:
- **api-client.ts**: Base Axios instance with request/response interceptors
- **Module services**: Domain-specific API operations (auth, members, finance, etc.)
- **Error handling**: Centralized error handling with automatic token refresh
- **Authentication**: JWT tokens automatically attached to requests

#### Context-Based State Management
- **AuthProvider**: User authentication state and methods
- **CurrencyProvider**: Global currency management with localStorage persistence
- **ThemeProvider**: Light/dark theme switching

#### Component Architecture
- **Base UI components**: Reusable primitives from shadcn/ui
- **Composite components**: Domain-specific components combining base UI
- **Page components**: Route-specific implementations with full business logic

### Important Design Patterns

#### Responsive Design (Mobile-First)
- All components built mobile-first with Tailwind breakpoints
- Consistent spacing using Tailwind's spacing scale
- Touch-friendly button sizes (minimum 40px height)

#### Brand Color System
```css
--brand-primary: #2E8DB0    /* Deep Blue */
--brand-secondary: #28ACD1  /* Light Blue */
--brand-accent: #C49831     /* Gold */
--brand-success: #A5CF5D    /* Green */
--brand-dark: #080A09       /* Dark Text */
```

#### Currency-Neutral Financial Icons
- Use universal icons (wallet, banknote, receipt) instead of currency symbols
- Display actual currency (₵, $, €) in text, not icons
- Consistent across all financial interfaces

### Key Business Modules

#### Member Management
- Complete member lifecycle management
- Family relationship tracking
- Custom fields support
- Document attachment system

#### Financial Management
- Multi-currency support (GHS, USD, EUR, GBP)
- Comprehensive giving/donation tracking
- Budget management with approval workflows
- Expense tracking and reporting
- Receipt generation

#### Attendance System
- Service-based attendance tracking
- QR code check-in support
- Department and group-based attendance
- Historical attendance reporting

#### Asset Management
- Equipment and property tracking
- Maintenance scheduling
- Assignment tracking
- Category-based organization

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based UI rendering
- Automatic token refresh
- Protected routes with redirect

### API Integration
- RESTful API design
- Standardized response formats
- Pagination support for list endpoints
- Search and filtering capabilities
- File upload handling

### Development Guidelines

#### TypeScript Usage
- Strict type checking enabled
- Comprehensive type definitions in `lib/types.ts`
- Interface-first approach for data structures
- Proper error typing

#### Component Development
- Props interface for every component
- Consistent className prop for styling flexibility
- DisplayName for debugging
- Maximum 300 lines per component

#### Navigation Patterns
- Breadcrumb navigation for nested pages
- Back navigation on detail pages
- Consistent page header layouts
- Context-aware navigation state

### Environment Configuration
Required environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=ChurchMS
```

### Key Dependencies
- **UI**: @radix-ui/*, shadcn/ui components
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **HTTP**: axios
- **Styling**: tailwindcss, tailwindcss-animate
- **Icons**: lucide-react
- **Charts**: recharts
- **Date handling**: date-fns
- **Animation**: framer-motion

## Important Project Rules

### From PROJECT_RULES.md

#### Brand Standards
- Use official color palette consistently
- Montserrat font family required
- Mobile-first responsive design mandatory
- Minimum touch target size of 40px

#### Component Guidelines
- Maximum 300 lines per component
- Always include className prop for flexibility
- Use TypeScript interfaces for all props
- Follow established naming conventions

#### Navigation Requirements
- Breadcrumb navigation on all nested pages
- Back navigation on detail/edit pages
- Consistent header layouts across modules
- Use appropriate contextual icons

#### Currency-Neutral Design
- Avoid currency symbols in icons
- Use universal financial icons (wallet, receipt, etc.)
- Display actual currency in text format only

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for service layer
- E2E tests for critical user flows

### Performance Considerations
- Code splitting by route (automatic with Next.js)
- Image optimization with next/image
- Lazy loading for below-fold content
- Bundle analysis for optimization

This system is designed for comprehensive church management with emphasis on user experience, accessibility, and maintainability. The architecture supports multi-tenant usage with branch-based data separation and extensive customization options.
