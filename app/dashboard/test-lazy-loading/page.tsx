'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Import all lazy loading components
import { LazyLoader, LazyContainer, LazyList } from '@/components/ui/lazy-loader';
import {
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  ListSkeleton,
  ProfileSkeleton,
  ChartSkeleton
} from '@/components/ui/skeleton-loaders';
import { LazyImage, LazyImageGallery, LazyAvatar } from '@/components/ui/lazy-image';
import { LazySection, LazyTabs } from '@/components/ui/lazy-section';
import {
  LoadingSpinner,
  FullPageLoader,
  InlineLoader,
  ButtonLoader
} from '@/components/ui/loading-spinner';

// Mock data
const mockImages = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    alt: 'Mountain landscape',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    alt: 'Forest path',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    alt: 'Ocean waves',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    alt: 'Desert landscape',
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
];

const mockListItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
  status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'inactive'
}));

// Mock async data loading
const mockLoadData = async (delay = 2000) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return {
    data: 'Loaded successfully!',
    timestamp: new Date().toISOString()
  };
};

const mockLoadDataWithError = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  throw new Error('Failed to load data');
};

export default function TestLazyLoadingPage() {
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleButtonClick = async () => {
    setButtonLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setButtonLoading(false);
  };

  const handleFullPageLoader = () => {
    setShowFullPageLoader(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowFullPageLoader(false);
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lazy Loading Components Test</h1>
        <p className="text-muted-foreground">
          Comprehensive testing page for all lazy loading components and features.
        </p>
      </div>

      <Tabs defaultValue="loaders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="loaders">Loaders</TabsTrigger>
          <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="spinners">Spinners</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Lazy Loaders Tab */}
        <TabsContent value="loaders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LazyLoader Component</CardTitle>
              <CardDescription>
                Basic lazy loading with intersection observer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Lazy Loading</h3>
                <LazyLoader
                  threshold={0.1}
                  rootMargin="50px"
                  fadeIn
                  height={200}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-2">Lazy Loaded Content</h4>
                      <p className="text-muted-foreground">
                        This content was loaded when it came into view!
                      </p>
                    </CardContent>
                  </Card>
                </LazyLoader>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lazy List</h3>
                <LazyList
                  items={mockListItems}
                  renderItem={(item, index) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  initialCount={5}
                  loadMoreCount={5}
                  itemHeight={80}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skeletons Tab */}
        <TabsContent value="skeletons" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <CardSkeleton
                  count={2}
                  showHeader
                  showAvatar
                  contentLines={3}
                  showActions
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>List Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <ListSkeleton
                  items={4}
                  showAvatar
                  showSecondary
                  showActions
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Table Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <TableSkeleton
                  columns={4}
                  rows={3}
                  showHeader
                  showFilters
                  showPagination
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <FormSkeleton
                  fields={4}
                  showTitle
                  showActions
                  layout="mixed"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileSkeleton
                  showCover
                  showStats
                  showBio
                  variant="card"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chart Skeleton</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartSkeleton
                  type="bar"
                  height="h-48"
                  showLegend
                  showTitle
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lazy Images</CardTitle>
              <CardDescription>
                Images with blur-up effect and error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Single Lazy Image</h3>
                <LazyImage
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                  alt="Mountain landscape"
                  width={600}
                  height={400}
                  blurUp
                  aspectRatio="3/2"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Image Gallery</h3>
                <LazyImageGallery
                  images={mockImages}
                  grid={{ cols: 1, sm: 2, md: 3, lg: 4 }}
                  aspectRatio="4/3"
                  objectFit="cover"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lazy Avatars</h3>
                <div className="flex items-center space-x-4">
                  <LazyAvatar
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    alt="John Doe"
                    size="sm"
                    fallback="JD"
                  />
                  <LazyAvatar
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                    alt="Jane Smith"
                    size="md"
                    fallback="JS"
                    online
                  />
                  <LazyAvatar
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                    alt="Mike Johnson"
                    size="lg"
                    fallback="MJ"
                  />
                  <LazyAvatar
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                    alt="Sarah Wilson"
                    size="xl"
                    fallback="SW"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lazy Sections</CardTitle>
                <CardDescription>
                  Sections with different loading strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <LazySection
                  strategy="lazy"
                  title="Lazy Loaded Section"
                  description="This section loads when it comes into view"
                  loadData={() => mockLoadData(1500)}
                  showHeader
                  showSkeleton
                  skeletonVariant="card"
                  skeletonCount={3}
                  card
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Card {i + 1}</h4>
                          <p className="text-sm text-muted-foreground">
                            This content was lazy loaded!
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </LazySection>

                <LazySection
                  strategy="lazy"
                  title="Section with Error"
                  description="This section demonstrates error handling"
                  loadData={mockLoadDataWithError}
                  showHeader
                  enableRetry
                  maxRetries={3}
                  card
                >
                  <p>This content should not be visible due to error.</p>
                </LazySection>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lazy Tabs</CardTitle>
                <CardDescription>
                  Tabs with lazy loaded content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazyTabs
                  tabs={[
                    {
                      id: 'tab1',
                      label: 'Tab 1',
                      content: (
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">Tab 1 Content</h3>
                          <p className="text-muted-foreground">
                            This content was lazy loaded when the tab was activated.
                          </p>
                        </div>
                      ),
                      loadData: () => mockLoadData(1000)
                    },
                    {
                      id: 'tab2',
                      label: 'Tab 2',
                      content: (
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">Tab 2 Content</h3>
                          <p className="text-muted-foreground">
                            This is the second tab's content.
                          </p>
                        </div>
                      ),
                      loadData: () => mockLoadData(800)
                    },
                    {
                      id: 'tab3',
                      label: 'Tab 3',
                      content: (
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">Tab 3 Content</h3>
                          <p className="text-muted-foreground">
                            This is the third tab's content.
                          </p>
                        </div>
                      ),
                      loadData: () => mockLoadData(1200)
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Spinners Tab */}
        <TabsContent value="spinners" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Default Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="default" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dots Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="dots" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bars Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="bars" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Circle Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="circle" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pulse Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="pulse" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="bounce" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wave Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="wave" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ring Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <LoadingSpinner variant="ring" size="lg" text="Loading..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Loader</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-8">
                <Button onClick={handleButtonClick} disabled={buttonLoading}>
                  <ButtonLoader
                    loading={buttonLoading}
                    loadingText="Processing..."
                  >
                    Click Me
                  </ButtonLoader>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Full Page Loader</CardTitle>
              <CardDescription>
                Click the button to see the full page loader with progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleFullPageLoader}>
                Show Full Page Loader
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-world Examples</CardTitle>
              <CardDescription>
                Practical examples of lazy loading in action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Example 1: Dashboard Cards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dashboard Cards</h3>
                <LazyContainer grid={{ cols: 1, md: 2, lg: 4 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <LazyLoader
                      key={i}
                      threshold={0.1}
                      rootMargin="100px"
                      fadeIn
                    >
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            Metric {i + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {(Math.random() * 1000).toFixed(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            +{(Math.random() * 20).toFixed(1)}% from last month
                          </p>
                        </CardContent>
                      </Card>
                    </LazyLoader>
                  ))}
                </LazyContainer>
              </div>

              <Separator />

              {/* Example 2: Content Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content Feed</h3>
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <LazyLoader
                      key={i}
                      threshold={0.1}
                      rootMargin="200px"
                      fadeIn
                      fallback={
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded animate-pulse" />
                                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      }
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-brand-primary">
                                {String.fromCharCode(65 + i)}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold">Post Title {i + 1}</h4>
                              <p className="text-sm text-muted-foreground">
                                This is a sample post content that was lazy loaded when it came into view.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </LazyLoader>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Full Page Loader */}
      {showFullPageLoader && (
        <FullPageLoader
          variant="circle"
          size="lg"
          text="Loading application..."
          showProgress
          progress={progress}
          logo={
            <div className="h-16 w-16 rounded-full bg-brand-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
          }
        />
      )}
    </div>
  );
}