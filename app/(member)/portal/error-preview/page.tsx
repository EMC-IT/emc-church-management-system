'use client';

import { useState } from 'react';
import {
  NotFoundView,
  SystemErrorView,
  NetworkErrorView,
  AccessDeniedView,
  MaintenanceView,
} from '@/components/errors';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MemberPageHeader } from '@/components/member/shared';

export default function ErrorStatesPreviewPage() {
  const [activeTab, setActiveTab] = useState('404');

  const sampleError = new Error('Database query connection timeout on PostgreSQL replica pool.');
  (sampleError as any).digest = 'ERR_PG_CONN_TIMEOUT_9843';

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Error States & Boundaries Preview"
        description="Interactive testing console to preview all custom error views, recovery actions, and diagnostics."
        breadcrumbs={[
          { label: 'Settings', href: '/portal/settings' },
          { label: 'Error States Preview' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="404" className="text-xs font-medium">
              404 — Page Not Found
            </TabsTrigger>
            <TabsTrigger value="500" className="text-xs font-medium">
              500 — System Error
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs font-medium">
              Network / Offline Error
            </TabsTrigger>
            <TabsTrigger value="403" className="text-xs font-medium">
              403 — Access Denied
            </TabsTrigger>
            <TabsTrigger value="503" className="text-xs font-medium">
              503 — Maintenance Mode
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 404 Tab */}
        <TabsContent value="404" className="pt-4">
          <NotFoundView scope="member" />
        </TabsContent>

        {/* 500 Tab */}
        <TabsContent value="500" className="pt-4">
          <SystemErrorView
            scope="member"
            error={sampleError}
            reset={() => alert('Retry handler triggered successfully!')}
          />
        </TabsContent>

        {/* Network Error Tab */}
        <TabsContent value="network" className="pt-4">
          <NetworkErrorView
            onRetry={() => alert('Checking connectivity and refreshing...')}
          />
        </TabsContent>

        {/* 403 Tab */}
        <TabsContent value="403" className="pt-4">
          <AccessDeniedView
            loginUrl="/login"
            returnUrl="/portal"
          />
        </TabsContent>

        {/* 503 Tab */}
        <TabsContent value="503" className="pt-4">
          <MaintenanceView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
