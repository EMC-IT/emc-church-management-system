'use client';

import { useState } from 'react';
import { MemberPageHeader } from '@/components/member/shared';
import { MemberSettings } from '@/lib/types/member';
import { ProfilePreferences } from './profile-preferences';
import { CommunicationPreferences } from './communication-preferences';
import { NotificationPreferences } from './notification-preferences';
import { PrivacyPreferences } from './privacy-preferences';
import { AppearancePreferences } from './appearance-preferences';
import { AccountPreferences } from './account-preferences';
import { SettingsSaveBar } from './settings-save-bar';
import { memberSettingsService } from '@/services/member';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface SettingsViewProps {
  initialSettings: MemberSettings;
  className?: string;
}

export function SettingsView({
  initialSettings,
  className,
}: SettingsViewProps) {
  const [savedSettings, setSavedSettings] =
    useState<MemberSettings>(initialSettings);
  const [currentSettings, setCurrentSettings] =
    useState<MemberSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const isDirty =
    JSON.stringify(savedSettings) !== JSON.stringify(currentSettings);

  const handleProfileChange = (
    updated: Partial<MemberSettings['profile']>
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updated },
    }));
  };

  const handleCommunicationChange = (
    updated: Partial<MemberSettings['communication']>
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      communication: { ...prev.communication, ...updated },
    }));
  };

  const handleNotificationChange = (
    updated: Partial<MemberSettings['notifications']>
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updated },
    }));
  };

  const handlePrivacyChange = (
    updated: Partial<MemberSettings['privacy']>
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...updated },
    }));
  };

  const handleAppearanceChange = (
    updated: Partial<MemberSettings['appearance']>
  ) => {
    setCurrentSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, ...updated },
    }));
  };

  const handleReset = () => {
    setCurrentSettings(JSON.parse(JSON.stringify(savedSettings)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await memberSettingsService.updateSettings(currentSettings);
      setSavedSettings(JSON.parse(JSON.stringify(updated)));
      setCurrentSettings(JSON.parse(JSON.stringify(updated)));
      toast({
        title: 'Preferences Saved',
        description: 'Your member preferences have been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Standalone Page Header */}
      <MemberPageHeader
        title="Settings"
        breadcrumbs={[{ label: 'Settings' }]}
      />

      {/* Settings Sections */}
      <div className="space-y-6">
        <ProfilePreferences
          preferences={currentSettings.profile}
          onChange={handleProfileChange}
        />

        <CommunicationPreferences
          preferences={currentSettings.communication}
          onChange={handleCommunicationChange}
        />

        <NotificationPreferences
          preferences={currentSettings.notifications}
          onChange={handleNotificationChange}
        />

        <PrivacyPreferences
          preferences={currentSettings.privacy}
          onChange={handlePrivacyChange}
        />

        <AppearancePreferences
          preferences={currentSettings.appearance}
          onChange={handleAppearanceChange}
        />

        <AccountPreferences />
      </div>

      {/* Sticky Save Bar */}
      <SettingsSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
}
