# Church Management System - Project Rules & Guidelines

## 📋 Table of Contents

1. [Brand Design System](#brand-design-system)
2. [Responsive Design Guidelines](#responsive-design-guidelines)
3. [Component Development Standards](#component-development-standards)
4. [Code Organization Rules](#code-organization-rules)
5. [Navigation & Routing](#navigation--routing)
6. [Page Layout Patterns](#page-layout-patterns)
7. [UI/UX Consistency Guidelines](#uiux-consistency-guidelines)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Performance Standards](#performance-standards)
10. [File Naming Conventions](#file-naming-conventions)
11. [Git Workflow Rules](#git-workflow-rules)
12. [Testing Requirements](#testing-requirements)

---

## 🎨 Brand Design System

### Official Color Palette

#### Primary Colors
```css
/* Brand Colors */
--brand-primary: #2E8DB0;    /* Deep Blue - Main brand color */
--brand-secondary: #28ACD1;  /* Light Blue - Secondary brand color */
--brand-accent: #C49831;     /* Gold - Accent color */
--brand-success: #A5CF5D;    /* Green - Success color */
--brand-dark: #080A09;       /* Dark - Text and backgrounds */
```

#### Usage Guidelines

**Primary Blue (#2E8DB0)**
- Primary buttons and CTAs
- Main navigation highlights
- Active states
- Primary links
- Brand elements

**Secondary Blue (#28ACD1)**
- Secondary buttons
- Hover states
- Accent elements
- Chart data series
- Information highlights

**Gold (#C49831)**
- Warning states
- Special highlights
- Premium features
- Important notifications
- Status indicators

**Success Green (#A5CF5D)**
- Success states
- Positive actions
- Confirmations
- Completed status
- Growth indicators

**Dark (#080A09)**
- Primary text
- Borders
- Dark mode backgrounds
- Icons

### Typography

#### Font Family
- **Primary**: Montserrat (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

#### Font Weights
- **Regular**: 400 (body text)
- **Medium**: 500 (labels, captions)
- **Semibold**: 600 (headings, emphasis)
- **Bold**: 700 (main headings)

#### Font Sizes (Tailwind Classes)
```css
/* Headings */
.text-3xl    /* 30px - Main page titles */
.text-2xl    /* 24px - Section headings */
.text-xl     /* 20px - Card titles */
.text-lg     /* 18px - Subheadings */

/* Body Text */
.text-base   /* 16px - Default body text */
.text-sm     /* 14px - Secondary text */
.text-xs     /* 12px - Captions, labels */
```

### Spacing System

#### Consistent Spacing Scale
```css
/* Tailwind Spacing Classes */
.space-y-1   /* 4px - Tight spacing */
.space-y-2   /* 8px - Close elements */
.space-y-4   /* 16px - Default spacing */
.space-y-6   /* 24px - Section spacing */
.space-y-8   /* 32px - Large spacing */
```

#### Layout Spacing
- **Container padding**: `p-6` (24px)
- **Card padding**: `p-4` or `p-6`
- **Button padding**: `px-4 py-2`
- **Form spacing**: `space-y-4`

### Border Radius
```css
/* Consistent Border Radius */
.rounded-sm  /* 2px - Small elements */
.rounded-md  /* 6px - Default (buttons, inputs) */
.rounded-lg  /* 8px - Cards, modals */
.rounded-xl  /* 12px - Large containers */
```

---

## 📱 Responsive Design Guidelines

### Mobile-First Approach

**MANDATORY**: All components must be designed mobile-first, then enhanced for larger screens.

#### Breakpoints (Tailwind)
```css
/* Mobile First Breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Grid System

#### Responsive Grid Patterns
```jsx
/* Standard responsive grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

/* Dashboard cards */
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Stats cards */}
</div>

/* Form layouts */
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Form fields */}
</div>
```

### Component Responsiveness Rules

#### Navigation
- **Mobile**: Collapsible hamburger menu
- **Tablet**: Condensed sidebar
- **Desktop**: Full sidebar with labels

#### Data Tables
- **Mobile**: Horizontal scroll with sticky first column
- **Tablet**: Show essential columns only
- **Desktop**: Full table with all columns

#### Forms
- **Mobile**: Single column layout
- **Tablet**: Two column layout for related fields
- **Desktop**: Multi-column with logical grouping

#### Cards
- **Mobile**: Full width, stacked
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

### Touch Targets

#### Minimum Sizes
- **Buttons**: `h-10` (40px) minimum on mobile
- **Touch areas**: `h-12` (48px) for primary actions
- **Icons**: `h-6 w-6` (24px) minimum
- **Form inputs**: `h-10` (40px) minimum

### Typography Responsiveness
```jsx
/* Responsive headings */
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

/* Responsive body text */
<p className="text-sm md:text-base">
```

---

## 🧩 Component Development Standards

### Component Structure

#### File Organization
```
components/
├── ui/              # Base UI components (shadcn/ui)
├── forms/           # Form-specific components
├── layout/          # Layout components
├── auth/            # Authentication components
└── charts/          # Chart components
```

#### Component Template
```tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
  // Other props
}

export function ComponentName({
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {children}
    </div>
  );
}

ComponentName.displayName = 'ComponentName';
```

### Component Guidelines

#### Size Limits
- **Maximum**: 300 lines per component
- **Recommended**: 150-200 lines
- **Action**: Split into smaller components if exceeded

#### Props Interface
- Always define TypeScript interfaces
- Use descriptive prop names
- Provide default values where appropriate
- Include `className` prop for styling flexibility

#### State Management
- Use local state for component-specific data
- Use Context for shared state
- Avoid prop drilling beyond 2 levels

### Reusability Standards

#### Component Categories

**Base Components** (`ui/`)
- No business logic
- Highly reusable
- Style-focused
- Examples: Button, Input, Card

**Composite Components** (`forms/`, `layout/`)
- Combine base components
- Some business logic
- Domain-specific
- Examples: MemberForm, DataTable

**Page Components** (`app/`)
- Full page implementations
- Business logic heavy
- Route-specific
- Examples: Dashboard, MembersPage

---

## 📁 Code Organization Rules

### Directory Structure

#### Mandatory Structure
```
emc-church-system/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── auth/             # Auth components
├── services/             # API service layer
├── lib/                  # Utilities and contexts
│   ├── contexts/         # React contexts
│   ├── types.ts          # Type definitions
│   ├── utils.ts          # Utility functions
│   └── permissions.ts    # Permission definitions
├── hooks/               # Custom React hooks
└── public/              # Static assets
```

### Import Organization

#### Import Order
```tsx
// 1. React and Next.js imports
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 3. Internal components (UI first)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal utilities and services
import { cn } from '@/lib/utils';
import { membersService } from '@/services';

// 5. Types and interfaces
import { Member, MemberFormData } from '@/lib/types';
```

### Code Style Rules

#### TypeScript
- **Strict mode**: Always enabled
- **Interfaces**: Prefer over types for object shapes
- **Enums**: Use for fixed sets of values
- **Generics**: Use for reusable components

#### React
- **Functional components**: Always use
- **Hooks**: Follow rules of hooks
- **Props**: Destructure in function signature
- **Event handlers**: Use arrow functions

---

## 🧭 Navigation & Routing

### Breadcrumb Navigation System

#### Implementation Guidelines

**MANDATORY**: All nested pages must implement breadcrumb navigation for better user orientation.

#### Breadcrumb Component Structure
```tsx
// components/ui/breadcrumb.tsx
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ items, separator = '›', className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground">{separator}</span>
          )}
          {item.href && !item.isCurrentPage ? (
            <Link href={item.href} className="text-brand-primary hover:text-brand-primary/80">
              {item.label}
            </Link>
          ) : (
            <span className={item.isCurrentPage ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

#### Dynamic Breadcrumb Generation

**Context-Aware Breadcrumbs**: Show meaningful titles instead of IDs

```tsx
// Example: Prayer Request Details Page
// URL: /prayer-requests/123
// Breadcrumb: Prayer Requests › Pray for Healing

const generateBreadcrumbs = (pathname: string, data?: any) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Base breadcrumb
  breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
  
  // Dynamic segments
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    if (segment === 'prayer-requests') {
      breadcrumbs.push({ label: 'Prayer Requests', href });
    } else if (segment.match(/^\d+$/)) {
      // Dynamic ID - use data to get meaningful title
      const title = data?.title || `Item ${segment}`;
      breadcrumbs.push({ label: title, isCurrentPage: true });
    } else if (segment === 'add') {
      breadcrumbs.push({ label: 'Add New', isCurrentPage: true });
    } else if (segment === 'edit') {
      breadcrumbs.push({ label: 'Edit', isCurrentPage: true });
    }
  });
  
  return breadcrumbs;
};
```

#### Breadcrumb Data Fetching Strategy

```tsx
// Custom hook for breadcrumb data
export function useBreadcrumbData(pathname: string, id?: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (id && pathname.includes(id)) {
      setLoading(true);
      // Fetch data based on route
      if (pathname.includes('prayer-requests')) {
        prayerRequestsService.getById(id)
          .then(request => setData({ title: request.title }))
          .finally(() => setLoading(false));
      } else if (pathname.includes('members')) {
        membersService.getById(id)
          .then(member => setData({ title: `${member.firstName} ${member.lastName}` }))
          .finally(() => setLoading(false));
      }
      // Add more route handlers as needed
    }
  }, [pathname, id]);
  
  return { data, loading };
}
```

#### URL-to-Breadcrumb Mapping Patterns

```tsx
// Breadcrumb mapping configuration
const BREADCRUMB_CONFIG = {
  '/dashboard': { label: 'Dashboard' },
  '/dashboard/members': { label: 'Members' },
  '/dashboard/members/add': { label: 'Add Member' },
  '/dashboard/members/[id]': { label: (data) => `${data.firstName} ${data.lastName}` },
  '/dashboard/members/[id]/edit': { label: 'Edit Member' },
  '/dashboard/prayer-requests': { label: 'Prayer Requests' },
  '/dashboard/prayer-requests/add': { label: 'Submit Request' },
  '/dashboard/prayer-requests/[id]': { label: (data) => data.title },
  '/dashboard/finance': { label: 'Finance' },
  '/dashboard/finance/giving': { label: 'Giving' },
  '/dashboard/finance/giving/donations': { label: 'Donations' },
  '/dashboard/finance/giving/donations/add': { label: 'Record Donation' },
  '/dashboard/finance/giving/pledges': { label: 'Pledges' },
  '/dashboard/finance/giving/categories': { label: 'Categories' },
  '/dashboard/finance/giving/reports': { label: 'Reports' },
  '/dashboard/events': { label: 'Events' },
  '/dashboard/events/add': { label: 'Create Event' },
  '/dashboard/events/[id]': { label: (data) => data.title },
};
```

### Navigation Hierarchy Rules

#### Consistent Navigation Patterns

1. **Main Navigation**: Always visible in sidebar
2. **Breadcrumbs**: Show current location and path
3. **Page Actions**: Consistent placement (top-right)
4. **Back Navigation**: Available on detail pages

#### Navigation State Management

```tsx
// Navigation context for consistent state
export const NavigationContext = createContext({
  currentPath: '',
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export function NavigationProvider({ children }) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  return (
    <NavigationContext.Provider value={{
      currentPath: pathname,
      breadcrumbs,
      setBreadcrumbs
    }}>
      {children}
    </NavigationContext.Provider>
  );
}
```

---

## 📄 Page Layout Patterns

### Next.js App Router Nested Routing

#### File Organization Structure

**MANDATORY**: Follow this exact structure for all modules

```
app/dashboard/
├── layout.tsx                    # Dashboard layout wrapper
├── page.tsx                      # Dashboard home (/dashboard)
├── members/
│   ├── layout.tsx               # Members module layout (optional)
│   ├── page.tsx                 # Members list (/dashboard/members)
│   ├── add/
│   │   └── page.tsx             # Add member (/dashboard/members/add)
│   ├── [id]/
│   │   ├── page.tsx             # Member details (/dashboard/members/:id)
│   │   ├── edit/
│   │   │   └── page.tsx         # Edit member (/dashboard/members/:id/edit)
│   │   └── family/
│   │       └── page.tsx         # Family members (/dashboard/members/:id/family)
│   └── import/
│       └── page.tsx             # Import members (/dashboard/members/import)
├── prayer-requests/
│   ├── page.tsx                 # Prayer requests list (/dashboard/prayer-requests)
│   ├── add/
│   │   └── page.tsx             # Submit prayer request (/dashboard/prayer-requests/add)
│   └── [id]/
│       ├── page.tsx             # Prayer request details (/dashboard/prayer-requests/:id)
│       └── edit/
│           └── page.tsx         # Edit prayer request (/dashboard/prayer-requests/:id/edit)
├── finance/
│   ├── page.tsx                 # Finance overview (/dashboard/finance)
│   ├── giving/
│   ├── page.tsx             # Giving overview (/dashboard/finance/giving)
│   ├── categories/
│   │   ├── page.tsx         # Categories list (/dashboard/finance/giving/categories)
│   │   ├── add/
│   │   │   └── page.tsx     # Add category (/dashboard/finance/giving/categories/add)
│   │   └── [id]/
│   │       └── page.tsx     # Category details (/dashboard/finance/giving/categories/:id)
│   ├── pledges/
│   │   ├── page.tsx         # Pledges list (/dashboard/finance/giving/pledges)
│   │   ├── add/
│   │   │   └── page.tsx     # Record pledge (/dashboard/finance/giving/pledges/add)
│   │   └── [id]/
│   │       └── page.tsx     # Pledge details (/dashboard/finance/giving/pledges/:id)
│   ├── donations/
│   │   ├── page.tsx         # Donations list (/dashboard/finance/giving/donations)
│   │   ├── add/
│   │   │   └── page.tsx     # Record donation (/dashboard/finance/giving/donations/add)
│   │   └── [id]/
│   │       └── page.tsx     # Donation details (/dashboard/finance/giving/donations/:id)
│   └── reports/
│       └── page.tsx         # Giving reports (/dashboard/finance/giving/reports)
│   ├── budgets/
│   │   ├── page.tsx             # Budgets list (/dashboard/finance/budgets)
│   │   ├── add/
│   │   │   └── page.tsx         # Create budget (/dashboard/finance/budgets/add)
│   │   └── [id]/
│   │       └── page.tsx         # Budget details (/dashboard/finance/budgets/:id)
│   └── reports/
│       └── page.tsx             # Financial reports (/dashboard/finance/reports)
└── events/
    ├── page.tsx                 # Events list (/dashboard/events)
    ├── add/
    │   └── page.tsx             # Create event (/dashboard/events/add)
    ├── [id]/
    │   ├── page.tsx             # Event details (/dashboard/events/:id)
    │   ├── edit/
    │   │   └── page.tsx         # Edit event (/dashboard/events/:id/edit)
    │   ├── attendance/
    │   │   └── page.tsx         # Event attendance (/dashboard/events/:id/attendance)
    │   └── registrations/
    │       └── page.tsx         # Event registrations (/dashboard/events/:id/registrations)
    └── calendar/
        └── page.tsx             # Events calendar (/dashboard/events/calendar)
```

#### Route Handling Explanations

**Static Routes**
- `page.tsx` inside `prayer-requests/` → Handles `/dashboard/prayer-requests` (main list)
- `add/page.tsx` → Handles `/dashboard/prayer-requests/add` (form to submit new request)

**Dynamic Routes**
- `[id]/page.tsx` → Handles `/dashboard/prayer-requests/:id` (view single request by ID)
- `[id]/edit/page.tsx` → Handles `/dashboard/prayer-requests/:id/edit` (edit specific request)

**Nested Dynamic Routes**
- `members/[id]/family/page.tsx` → Handles `/dashboard/members/:id/family`
- `events/[id]/attendance/page.tsx` → Handles `/dashboard/events/:id/attendance`

#### Dynamic Route Parameters

```tsx
// app/dashboard/prayer-requests/[id]/page.tsx
export default function PrayerRequestDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch prayer request data
    prayerRequestsService.getById(params.id)
      .then(setRequest)
      .finally(() => setLoading(false));
  }, [params.id]);
  
  // Generate breadcrumbs with meaningful title
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Prayer Requests', href: '/dashboard/prayer-requests' },
    { label: request?.title || 'Loading...', isCurrentPage: true }
  ];
  
  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />
      {/* Page content */}
    </div>
  );
}
```

#### Layout Inheritance Patterns

```tsx
// app/dashboard/layout.tsx - Main dashboard layout
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// app/dashboard/members/layout.tsx - Optional module-specific layout
export default function MembersLayout({ children }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Members Management</h1>
        <Button asChild>
          <Link href="/dashboard/members/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
```

#### Page Template Standards

```tsx
// Standard page template
export default function ModuleListPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbs} />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground">Page description</p>
        </div>
        <div className="flex gap-2">
          {/* Action buttons */}
        </div>
      </div>
      
      {/* Page Content */}
      <div className="space-y-4">
        {/* Main content */}
      </div>
    </div>
  );
}
```

---

## 🎯 UI/UX Consistency Guidelines

### Design Principles

#### Hierarchy
- Clear visual hierarchy with typography
- Consistent spacing between elements
- Logical information grouping

#### Contrast
- Minimum 4.5:1 contrast ratio for text
- Clear distinction between interactive elements
- Proper color usage for status indication

#### Balance
- Symmetrical layouts where appropriate
- Consistent alignment patterns
- Balanced white space distribution

### Interaction Patterns

#### Button States
```tsx
/* Primary Button States */
.bg-brand-primary           /* Default */
.bg-brand-primary/90        /* Hover */
.bg-brand-primary/80        /* Active */
.bg-brand-primary/50        /* Disabled */
```

#### Loading States
- Show skeleton loaders for content
- Use spinners for actions
- Disable interactive elements during loading
- Provide feedback for long operations

#### Error States
- Clear error messages
- Contextual help text
- Recovery actions where possible
- Consistent error styling

### Status Indicators

#### Status Badge Colors
```tsx
/* Status Color Mapping */
Active: 'bg-brand-success'     /* Green */
Inactive: 'bg-gray-500'        /* Gray */
Pending: 'bg-brand-accent'     /* Gold */
Error: 'bg-destructive'        /* Red */
New: 'bg-brand-primary'        /* Blue */
```

---

## ♿ Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Color and Contrast
- **Text contrast**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **Non-text elements**: Minimum 3:1 ratio
- **Color independence**: Don't rely solely on color

#### Keyboard Navigation
- **Tab order**: Logical and predictable
- **Focus indicators**: Visible and clear
- **Skip links**: Provide for main content
- **Keyboard shortcuts**: Document and implement

#### Screen Reader Support
- **Semantic HTML**: Use proper elements
- **ARIA labels**: Provide where needed
- **Alt text**: Descriptive for images
- **Headings**: Proper hierarchy (h1-h6)

### Implementation Requirements

#### Form Accessibility
```tsx
/* Accessible form example */
<Label htmlFor="email">Email Address</Label>
<Input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email.message}
  </span>
)}
```

#### Interactive Elements
- **Buttons**: Use `<button>` element
- **Links**: Use `<a>` for navigation
- **Form controls**: Proper labels and descriptions
- **Focus management**: Handle modal and dropdown focus

---

## ⚡ Performance Standards

### Core Web Vitals Targets

#### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- **Optimization**: Image optimization, code splitting

#### First Input Delay (FID)
- **Target**: < 100 milliseconds
- **Optimization**: Minimize JavaScript execution

#### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Optimization**: Reserve space for dynamic content

### Optimization Requirements

#### Images
- **Format**: WebP with fallbacks
- **Sizing**: Responsive images with `next/image`
- **Loading**: Lazy loading for below-fold content
- **Compression**: Optimize file sizes

#### JavaScript
- **Bundle size**: Monitor and optimize
- **Code splitting**: Route-based splitting
- **Tree shaking**: Remove unused code
- **Lazy loading**: Dynamic imports for heavy components

#### CSS
- **Critical CSS**: Inline above-fold styles
- **Unused CSS**: Remove with PurgeCSS
- **Minification**: Compress in production

### Monitoring

#### Tools
- **Lighthouse**: Regular audits
- **Web Vitals**: Monitor core metrics
- **Bundle Analyzer**: Track bundle sizes
- **Performance API**: Custom metrics

---

## 📝 File Naming Conventions

### General Rules

#### Case Conventions
- **Components**: PascalCase (`MemberForm.tsx`)
- **Pages**: kebab-case (`member-details.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

#### File Extensions
- **React components**: `.tsx`
- **TypeScript files**: `.ts`
- **Styles**: `.css`
- **Configuration**: `.js` or `.ts`

### Specific Naming Patterns

#### Components
```
/* UI Components */
Button.tsx
DataTable.tsx
FormInput.tsx

/* Form Components */
member-form.tsx
donation-form.tsx
event-form.tsx

/* Page Components */
page.tsx              /* Default page */
layout.tsx            /* Layout component */
loading.tsx           /* Loading component */
error.tsx             /* Error component */
```

#### Services
```
/* Service Files */
api-client.ts         /* Base API client */
auth-service.ts       /* Authentication */
members-service.ts    /* Members CRUD */
finance-service.ts    /* Financial operations */
```

#### Types
```
/* Type Files */
types.ts              /* Global types */
auth.types.ts         /* Auth-specific types */
member.types.ts       /* Member-specific types */
```

---

## 🔄 Git Workflow Rules

### Branch Naming

#### Branch Types
```
/* Feature branches */
feature/member-management
feature/finance-dashboard

/* Bug fixes */
bugfix/login-validation
bugfix/table-sorting

/* Hotfixes */
hotfix/security-patch
hotfix/critical-bug

/* Releases */
release/v1.2.0
```

### Commit Messages

#### Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting, missing semicolons
- **refactor**: Code restructuring
- **test**: Adding tests
- **chore**: Maintenance tasks

#### Examples
```
feat(members): add member photo upload functionality

fix(auth): resolve login validation error

docs(readme): update installation instructions

style(components): fix linting issues in DataTable
```

### Pull Request Rules

#### Requirements
- **Description**: Clear description of changes
- **Testing**: Evidence of testing
- **Screenshots**: For UI changes
- **Breaking changes**: Clearly documented

#### Review Process
- **Minimum reviewers**: 1 for features, 2 for critical changes
- **Approval required**: Before merging
- **CI/CD**: All checks must pass

---

## 🧪 Testing Requirements

### Testing Strategy

#### Test Types
- **Unit tests**: Individual functions and components
- **Integration tests**: Component interactions
- **E2E tests**: Full user workflows
- **Visual regression**: UI consistency

### Testing Tools

#### Recommended Stack
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright or Cypress
- **Visual**: Chromatic or Percy
- **Performance**: Lighthouse CI

### Testing Standards

#### Coverage Requirements
- **Minimum**: 70% code coverage
- **Critical paths**: 90% coverage
- **New features**: 80% coverage

#### Test Organization
```
__tests__/
├── components/
│   ├── ui/
│   └── forms/
├── services/
├── utils/
└── e2e/
```

#### Component Testing
```tsx
/* Component test example */
import { render, screen } from '@testing-library/react';
import { MemberForm } from '@/components/forms/member-form';

describe('MemberForm', () => {
  it('renders form fields correctly', () => {
    render(<MemberForm />);
    
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    // Test validation logic
  });
});
```

---

## 🚀 Development Workflow

### Setup Requirements

#### Environment
- **Node.js**: 18+ LTS
- **Package Manager**: npm or yarn
- **IDE**: VS Code with recommended extensions
- **Browser**: Chrome/Firefox with dev tools

#### Pre-commit Hooks
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type checking**: TypeScript
- **Testing**: Run affected tests

### Code Quality

#### Linting Rules
- **ESLint**: Extend Next.js config
- **TypeScript**: Strict mode enabled
- **Prettier**: Consistent formatting
- **Import sorting**: Organized imports

#### Quality Gates
- **Build**: Must pass without errors
- **Tests**: All tests must pass
- **Coverage**: Meet minimum thresholds
- **Performance**: Lighthouse scores

---

## 📚 Documentation Requirements

### Code Documentation

#### Component Documentation
```tsx
/**
 * MemberForm component for creating and editing church members
 * 
 * @param member - Existing member data for editing
 * @param onSubmit - Callback function when form is submitted
 * @param loading - Loading state for form submission
 * 
 * @example
 * ```tsx
 * <MemberForm
 *   member={existingMember}
 *   onSubmit={handleSubmit}
 *   loading={isSubmitting}
 * />
 * ```
 */
export function MemberForm({ member, onSubmit, loading }: MemberFormProps) {
  // Component implementation
}
```

#### API Documentation
- **Service methods**: JSDoc comments
- **Type definitions**: Inline documentation
- **Error handling**: Document error cases
- **Examples**: Usage examples

### README Updates
- **Setup instructions**: Keep current
- **Feature documentation**: Document new features
- **API changes**: Document breaking changes
- **Troubleshooting**: Common issues and solutions

---

## 🔒 Security Guidelines

### Authentication
- **JWT tokens**: Secure storage and handling
- **Session management**: Proper timeout and refresh
- **Route protection**: Implement guards
- **Permission checks**: Validate on every action

### Data Handling
- **Input validation**: Client and server-side
- **XSS prevention**: Sanitize user inputs
- **CSRF protection**: Implement tokens
- **Sensitive data**: Never log or expose

### Dependencies
- **Regular updates**: Keep dependencies current
- **Security audits**: Run npm audit regularly
- **Vulnerability scanning**: Automated checks
- **License compliance**: Verify license compatibility

---

## 📊 Monitoring and Analytics

### Error Tracking
- **Error boundaries**: Catch React errors
- **Logging**: Structured error logging
- **User feedback**: Error reporting mechanism
- **Monitoring**: Real-time error tracking

### Performance Monitoring
- **Core Web Vitals**: Track key metrics
- **User experience**: Monitor user interactions
- **Bundle analysis**: Track bundle sizes
- **API performance**: Monitor response times

### Usage Analytics
- **Feature usage**: Track feature adoption
- **User flows**: Understand user behavior
- **Performance impact**: Correlate features with performance
- **A/B testing**: Test improvements

---

## 🎯 Conclusion

These project rules ensure consistency, quality, and maintainability across the Church Management System. All team members must follow these guidelines to maintain code quality and user experience standards.

### Key Principles
1. **Mobile-first responsive design**
2. **Accessibility compliance**
3. **Performance optimization**
4. **Code consistency**
5. **User experience focus**

### Enforcement
- **Code reviews**: Enforce during PR reviews
- **Automated checks**: CI/CD pipeline validation
- **Documentation**: Keep guidelines updated
- **Training**: Regular team training sessions