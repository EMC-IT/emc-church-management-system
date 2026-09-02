'use client';

import { Switch } from '@/components/ui/switch';
import { SettingsSection } from './settings-section';
import { NotificationPreferences as INotificationPreferences } from '@/lib/types/member';
import { NOTIFICATION_CATEGORIES_CONFIG } from '@/lib/config/member/settings';

export interface NotificationPreferencesProps {
  preferences: INotificationPreferences;
  onChange: (updated: Partial<INotificationPreferences>) => void;
}

export function NotificationPreferences({
  preferences,
  onChange,
}: NotificationPreferencesProps) {
  return (
    <SettingsSection
      title="Notification Categories"
      description="Select which church activities and ministry updates trigger personal alerts."
    >
      <div className="divide-y divide-border/30">
        {NOTIFICATION_CATEGORIES_CONFIG.map((category) => {
          const isChecked = preferences[category.key];
          return (
            <div
              key={category.key}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5 min-w-0 pr-4">
                <span className="text-xs font-semibold text-foreground block">
                  {category.title}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>

              <Switch
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onChange({ [category.key]: checked })
                }
                aria-label={`Toggle ${category.title} notifications`}
              />
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
