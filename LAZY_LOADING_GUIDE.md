# Lazy Loading Components Guide

This guide provides comprehensive documentation for the lazy loading system implemented in the church management system. The system includes multiple reusable components designed to improve performance and user experience.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Custom Hook](#custom-hook)
3. [Core Components](#core-components)
4. [Skeleton Loaders](#skeleton-loaders)
5. [Image Components](#image-components)
6. [Section Components](#section-components)
7. [Loading Spinners](#loading-spinners)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [Performance Tips](#performance-tips)

## Overview

The lazy loading system is built around the Intersection Observer API and provides:

- **Performance Optimization**: Load content only when needed
- **Better User Experience**: Smooth loading transitions and skeleton states
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Error Handling**: Graceful error states with retry functionality
- **TypeScript Support**: Full type safety and IntelliSense

## Custom Hook

### `useLazyLoading`

The foundation hook that provides intersection observer functionality.

```tsx
import { useLazyLoading } from '@/hooks/use-lazy-loading';

const { ref, inView, hasBeenInView } = useLazyLoading({
  threshold: 0.1,
  rootMargin: '50px',
  triggerOnce: true
});
```

**Options:**
- `root`: Root element for intersection observation
- `rootMargin`: Margin around root element
- `threshold`: Intersection threshold (0-1)
- `triggerOnce`: Whether to trigger only once
- `delay`: Delay before triggering (ms)

### `useLazyImage`

Specialized hook for image lazy loading.

```tsx
const { ref, inView, loaded, error, src } = useLazyImage(imageSrc, {
  threshold: 0.1
});
```

### `useLazyLoadWithRetry`

Hook with retry functionality for data loading.

```tsx
const { ref, data, loading, error, retry } = useLazyLoadWithRetry(
  () => fetchData(),
  { maxRetries: 3, retryDelay: 1000 }
);
```

## Core Components

### `LazyLoader`

General-purpose lazy loading wrapper.

```tsx
import { LazyLoader } from '@/components/ui/lazy-loader';

<LazyLoader
  threshold={0.1}
  rootMargin="50px"
  fadeIn
  height={200}
  fallback={<CustomSkeleton />}
>
  <ExpensiveComponent />
</LazyLoader>
```

**Props:**
- `children`: Content to lazy load
- `fallback`: Loading component
- `height/width`: Container dimensions
- `fadeIn`: Enable fade-in animation
- `maintainDimensions`: Keep container size during loading

### `LazyContainer`

Container for multiple lazy-loaded items with grid support.

```tsx
<LazyContainer
  grid={{ cols: 1, md: 2, lg: 3 }}
  gap="gap-4"
>
  {items.map(item => (
    <LazyLoader key={item.id}>
      <ItemComponent item={item} />
    </LazyLoader>
  ))}
</LazyContainer>
```

### `LazyList`

Efficient list rendering with virtual scrolling support.

```tsx
<LazyList
  items={largeDataset}
  renderItem={(item, index) => <ItemComponent item={item} />}
  initialCount={10}
  loadMoreCount={10}
  virtual={true}
  itemHeight={60}
/>
```

## Skeleton Loaders

### `CardSkeleton`

Skeleton for card-based content.

```tsx
import { CardSkeleton } from '@/components/ui/skeleton-loaders';

<CardSkeleton
  count={3}
  showHeader
  showAvatar
  contentLines={3}
  showActions
/>
```

### `TableSkeleton`

Skeleton for data tables.

```tsx
<TableSkeleton
  columns={4}
  rows={5}
  showHeader
  showFilters
  showPagination
/>
```

### `FormSkeleton`

Skeleton for forms.

```tsx
<FormSkeleton
  fields={6}
  showTitle
  showActions
  layout="mixed" // 'single' | 'double' | 'mixed'
/>
```

### `ListSkeleton`

Skeleton for list items.

```tsx
<ListSkeleton
  items={5}
  showAvatar
  showSecondary
  showActions
/>
```

### `ProfileSkeleton`

Skeleton for user profiles.

```tsx
<ProfileSkeleton
  showCover
  showStats
  showBio
  variant="card" // 'card' | 'page' | 'compact'
/>
```

### `ChartSkeleton`

Skeleton for charts and graphs.

```tsx
<ChartSkeleton
  type="bar" // 'bar' | 'line' | 'pie' | 'area'
  height="h-64"
  showLegend
  showTitle
/>
```

## Image Components

### `LazyImage`

Lazy loading images with blur-up effect.

```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="/images/photo.jpg"
  alt="Description"
  width={400}
  height={300}
  blurUp
  blurDataURL="data:image/jpeg;base64,..."
  aspectRatio="4/3"
  objectFit="cover"
  enableRetry
  onLoad={() => console.log('Image loaded')}
  onError={(error) => console.error('Image failed', error)}
/>
```

**Features:**
- Blur-up effect with placeholder
- Error handling with retry
- Responsive image support
- Multiple object-fit options
- Loading states and animations

### `LazyImageGallery`

Gallery component for multiple images.

```tsx
<LazyImageGallery
  images={[
    { src: '/img1.jpg', alt: 'Image 1' },
    { src: '/img2.jpg', alt: 'Image 2' }
  ]}
  grid={{ cols: 1, sm: 2, md: 3, lg: 4 }}
  aspectRatio="1/1"
  lightbox
  onImageClick={(index, image) => openLightbox(index)}
/>
```

### `LazyAvatar`

Avatar component with fallback.

```tsx
<LazyAvatar
  src="/avatar.jpg"
  alt="John Doe"
  size="lg" // 'sm' | 'md' | 'lg' | 'xl'
  fallback="JD"
  online
/>
```

## Section Components

### `LazySection`

Lazy loading for entire content sections.

```tsx
import { LazySection } from '@/components/ui/lazy-section';

<LazySection
  strategy="lazy" // 'immediate' | 'lazy' | 'on-demand' | 'progressive'
  title="Section Title"
  description="Section description"
  loadData={async () => await fetchSectionData()}
  showHeader
  showSkeleton
  skeletonVariant="card"
  enableRetry
  maxRetries={3}
  card
>
  <SectionContent />
</LazySection>
```

**Loading Strategies:**
- `immediate`: Load immediately
- `lazy`: Load when in view
- `on-demand`: Load on user interaction
- `progressive`: Load in steps

### `LazyTabs`

Tabs with lazy-loaded content.

```tsx
<LazyTabs
  tabs={[
    {
      id: 'tab1',
      label: 'Tab 1',
      content: <TabContent />,
      loadData: () => fetchTabData()
    }
  ]}
  defaultTab="tab1"
  onTabChange={(tabId) => console.log('Tab changed:', tabId)}
/>
```

## Loading Spinners

### `LoadingSpinner`

Versatile spinner component with multiple variants.

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner
  variant="dots" // 'default' | 'dots' | 'bars' | 'circle' | 'pulse' | 'bounce' | 'wave' | 'ring'
  size="lg" // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  text="Loading..."
  color="#2E8DB0"
  speed="normal" // 'slow' | 'normal' | 'fast'
  overlay
  blurBackground
/>
```

### `FullPageLoader`

Full-page loading with progress.

```tsx
<FullPageLoader
  variant="circle"
  size="lg"
  text="Loading application..."
  showProgress
  progress={75}
  logo={<Logo />}
/>
```

### `InlineLoader`

Inline loading states.

```tsx
<InlineLoader
  loading={isLoading}
  variant="dots"
  size="sm"
  replace={false}
>
  Content to show when not loading
</InlineLoader>
```

### `ButtonLoader`

Button loading states.

```tsx
<Button disabled={loading}>
  <ButtonLoader
    loading={loading}
    loadingText="Processing..."
    size="sm"
  >
    Submit
  </ButtonLoader>
</Button>
```

## Usage Examples

### Dashboard Cards

```tsx
<LazyContainer grid={{ cols: 1, md: 2, lg: 4 }}>
  {metrics.map((metric) => (
    <LazyLoader key={metric.id} threshold={0.1}>
      <MetricCard metric={metric} />
    </LazyLoader>
  ))}
</LazyContainer>
```

### Data Table

```tsx
<LazySection
  strategy="lazy"
  loadData={() => fetchTableData()}
  fallback={<TableSkeleton columns={5} rows={10} />}
>
  <DataTable data={tableData} />
</LazySection>
```

### Image Gallery

```tsx
<LazyImageGallery
  images={photos}
  grid={{ cols: 1, sm: 2, md: 3, lg: 4 }}
  aspectRatio="1/1"
  lightbox
/>
```

### Content Feed

```tsx
<LazyList
  items={posts}
  renderItem={(post) => (
    <LazyLoader>
      <PostCard post={post} />
    </LazyLoader>
  )}
  initialCount={5}
  loadMoreCount={5}
/>
```

## Best Practices

### 1. Choose the Right Strategy

- **Immediate**: Critical above-the-fold content
- **Lazy**: Below-the-fold content
- **On-demand**: Heavy components triggered by user action
- **Progressive**: Complex sections that can load in steps

### 2. Optimize Thresholds

```tsx
// Load just before entering viewport
<LazyLoader threshold={0} rootMargin="100px">

// Load when 50% visible
<LazyLoader threshold={0.5}>

// Load when fully visible
<LazyLoader threshold={1}>
```

### 3. Provide Meaningful Fallbacks

```tsx
<LazyLoader
  fallback={<CardSkeleton showHeader showAvatar />}
>
  <UserCard />
</LazyLoader>
```

### 4. Handle Errors Gracefully

```tsx
<LazySection
  loadData={fetchData}
  enableRetry
  maxRetries={3}
  onError={(error) => logError(error)}
>
```

### 5. Use Appropriate Skeleton Types

- `CardSkeleton` for card layouts
- `TableSkeleton` for data tables
- `ListSkeleton` for list items
- `FormSkeleton` for forms

## Performance Tips

### 1. Batch API Calls

```tsx
const loadMultipleSections = async () => {
  const [users, posts, stats] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchStats()
  ]);
  return { users, posts, stats };
};
```

### 2. Use Virtual Scrolling for Large Lists

```tsx
<LazyList
  items={largeDataset}
  virtual
  itemHeight={60}
  containerHeight={400}
/>
```

### 3. Optimize Images

```tsx
<LazyImage
  src="/image.jpg"
  blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isAboveFold}
/>
```

### 4. Preload Critical Resources

```tsx
// Preload next page data
const { ref } = useLazyLoading({
  rootMargin: '200px',
  triggerOnce: true
});

useEffect(() => {
  if (inView) {
    preloadNextPage();
  }
}, [inView]);
```

### 5. Monitor Performance

```tsx
const handleLoad = () => {
  // Track loading performance
  analytics.track('lazy_load_complete', {
    component: 'UserList',
    loadTime: Date.now() - startTime
  });
};
```

## Testing

To test the lazy loading components, visit `/dashboard/test-lazy-loading` in your application. This page includes:

- All component variants
- Interactive examples
- Performance demonstrations
- Error handling scenarios
- Responsive behavior tests

The test page is designed to help you understand how each component works and see them in action with realistic data and scenarios.