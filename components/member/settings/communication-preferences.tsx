'use client';

import { Switch } from '@/components/ui/switch';
import { SettingsSection } from './settings-section';
import { CommunicationPreferences as ICommunicationPreferences } from '@/lib/types/member';
import { COMMUNICATION_CHANNELS } from '@/lib/config/member/settings';

export interface CommunicationPreferencesProps {
  preferences: ICommunicationPreferences;
  onChange: (updated: Partial<ICommunicationPreferences>) => void;
}

export function CommunicationPreferences({
  preferences,
  onChange,
}: CommunicationPreferencesProps) {
  return (
    <SettingsSection
      title="Communication Channels"
      description="Choose how you prefer to receive church updates, announcements, and bulletins."
    >
      <div className="divide-y divide-border/30">
        {COMMUNICATION_CHANNELS.map((channel) => {
          const isChecked = preferences[channel.key];
          return (
            <div
              key={channel.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5 min-w-0 pr-4">
                <span className="text-xs font-semibold text-foreground block">
                  {channel.title}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {channel.description}
                </p>
              </div>

              <Switch
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onChange({ [channel.key]: checked })
                }
                aria-label={`Toggle ${channel.title}`}
              />
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-border/30">
        <p className="text-[11px] text-muted-foreground italic">
          * Note: Essential transactional confirmations (such as giving receipts and password resets) are always sent.
        </p>
      </div>
    </SettingsSection>
  );
}
