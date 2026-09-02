'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsSection } from './settings-section';
import { ProfilePreferences as IProfilePreferences } from '@/lib/types/member';
import { SUPPORTED_LANGUAGES } from '@/lib/config/member/settings';

export interface ProfilePreferencesProps {
  preferences: IProfilePreferences;
  onChange: (updated: Partial<IProfilePreferences>) => void;
}

export function ProfilePreferences({
  preferences,
  onChange,
}: ProfilePreferencesProps) {
  return (
    <SettingsSection
      title="Profile Preferences"
      description="Personalize how your name and preferred location appear in the portal."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Display Name */}
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-xs font-medium text-foreground">
            Preferred Display Name
          </Label>
          <Input
            id="displayName"
            value={preferences.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="Your preferred name or nickname"
            className="h-9 text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Used across fellowship groups and ministry rosters.
          </p>
        </div>

        {/* Preferred Language */}
        <div className="space-y-1.5">
          <Label htmlFor="language" className="text-xs font-medium text-foreground">
            Portal Language
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(val) => onChange({ language: val })}
          >
            <SelectTrigger id="language" className="h-9 text-xs">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Default interface and bulletin communication language.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
