import { Metadata } from 'next';
import { memberDashboardService } from '@/services/member';
import {
  WelcomeHeader,
  StatSummaryCards,
  VerseBanner,
  MyGivingCard,
  AnnouncementsCard,
  MinistriesGrid,
  UpcomingEventsCard,
  QuickActionsCard,
} from '@/components/member/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Member Portal',
  description: 'Personalized church home and dashboard for EMC Church members',
};

export default async function MemberPortalPage() {
  const data = await memberDashboardService.getDashboardData();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Greeting Header */}
      <WelcomeHeader profile={data.profile} />

      {/* 2. Four Key Stat Summary Metric Cards */}
      <StatSummaryCards statCards={data.statCards} />

      {/* 3. Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left / Center Major Column (2 cols width) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Today's Verse Hero Banner */}
          <VerseBanner dailyVerse={data.dailyVerse} />

          {/* 2-Column Grid: My Giving & Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyGivingCard givingWidget={data.givingWidget} />
            <AnnouncementsCard announcements={data.announcements} />
          </div>

          {/* Ministries I'm Part Of */}
          <MinistriesGrid ministries={data.ministries} />
        </div>

        {/* Right Column (1 col width) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Upcoming Events Card with Day Block Badges */}
          <UpcomingEventsCard events={data.upcomingEvents} />

          {/* Quick Actions 2x3 Grid */}
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}
