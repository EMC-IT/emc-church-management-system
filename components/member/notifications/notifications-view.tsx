'use client';

import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MemberPageHeader } from '@/components/member/shared';
import { MemberNotification, MemberAnnouncement } from '@/lib/types/member';
import { NotificationOverview } from './notification-overview';
import { NotificationList } from './notification-list';
import { NotificationEmptyState } from './notification-empty-state';
import { memberNotificationsService } from '@/services/member';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface NotificationsViewProps {
  initialNotifications: MemberNotification[];
  initialAnnouncements: MemberAnnouncement[];
  className?: string;
}

export function NotificationsView({
  initialNotifications,
  initialAnnouncements,
  className,
}: NotificationsViewProps) {
  const [notifications, setNotifications] =
    useState<MemberNotification[]>(initialNotifications);
  const [announcements] =
    useState<MemberAnnouncement[]>(initialAnnouncements);
  const [currentTab, setCurrentTab] = useState('all');
  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await memberNotificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update notification status.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await memberNotificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      toast({
        title: 'All Caught Up',
        description: 'All notifications have been marked as read.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read.',
        variant: 'destructive',
      });
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Standalone Page Header */}
      <MemberPageHeader
        title="Notifications"
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-1.5 font-medium text-xs h-8"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all as read</span>
            </Button>
          ) : undefined
        }
      />

      {/* Summary Metrics */}
      <NotificationOverview
        totalCount={notifications.length}
        unreadCount={unreadCount}
        announcementCount={announcements.length}
      />

      {/* Tabs & Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs font-medium">
              All ({notifications.length + announcements.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs font-medium">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs font-medium">
              Announcements ({announcements.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Tab */}
        <TabsContent value="all" className="m-0 pt-1">
          {notifications.length > 0 || announcements.length > 0 ? (
            <NotificationList
              notifications={notifications}
              announcements={announcements}
              onMarkAsRead={handleMarkAsRead}
            />
          ) : (
            <NotificationEmptyState />
          )}
        </TabsContent>

        {/* Unread Tab */}
        <TabsContent value="unread" className="m-0 pt-1">
          {unreadNotifications.length > 0 ? (
            <NotificationList
              notifications={unreadNotifications}
              onMarkAsRead={handleMarkAsRead}
            />
          ) : (
            <NotificationEmptyState isUnreadOnly />
          )}
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="m-0 pt-1">
          {announcements.length > 0 ? (
            <NotificationList announcements={announcements} />
          ) : (
            <NotificationEmptyState />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
