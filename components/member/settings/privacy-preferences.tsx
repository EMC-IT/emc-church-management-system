'use client';

import { Switch } from '@/components/ui/switch';
import { SettingsSection } from './settings-section';
import { PrivacyPreferences as IPrivacyPreferences } from '@/lib/types/member';

export interface PrivacyPreferencesProps {
  preferences: IPrivacyPreferences;
  onChange: (updated: Partial<IPrivacyPreferences>) => void;
}

export function PrivacyPreferences({
  preferences,
  onChange,
}: PrivacyPreferencesProps) {
  return (
    <SettingsSection
      title="Privacy & Visibility"
      description="Control how your profile and contact details appear to other church members."
    >
      <div className="divide-y divide-border/30">
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
          <div className="space-y-0.5 min-w-0 pr-4">
            <span className="text-xs font-semibold text-foreground block">
              Member Directory Listing
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Allow fellow verified church members in your cell group and ministries to find your name.
            </p>
          </div>

          <Switch
            checked={preferences.directoryVisibility}
            onCheckedChange={(checked) =>
              onChange({ directoryVisibility: checked })
            }
            aria-label="Toggle directory visibility"
          />
        </div>

        <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
          <div className="space-y-0.5 min-w-0 pr-4">
            <span className="text-xs font-semibold text-foreground block">
              Profile Photo Visibility
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Show your profile picture on group rosters and fellowship attendance sheets.
            </p>
          </div>

          <Switch
            checked={preferences.profilePhotoVisibility}
            onCheckedChange={(checked) =>
              onChange({ profilePhotoVisibility: checked })
            }
            aria-label="Toggle profile photo visibility"
          />
        </div>
      </div>
    </SettingsSection>
  );
}
