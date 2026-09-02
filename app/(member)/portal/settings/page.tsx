import { Suspense } from 'react';
import { Metadata } from 'next';
import { SettingsView, SettingsSkeleton } from '@/components/member/settings';
import { memberSettingsService } from '@/services/member';

export const metadata: Metadata = {
  title: 'Settings & Preferences | EMC Member Portal',
  description:
    'Manage your communication channels, notification categories, privacy preferences, and portal theme.',
};

export default async function MemberSettingsPage() {
  const settings = await memberSettingsService.getSettings();

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsView initialSettings={settings} />
    </Suspense>
  );
}
