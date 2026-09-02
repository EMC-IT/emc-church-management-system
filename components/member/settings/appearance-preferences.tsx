'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './settings-section';
import { AppearancePreferences as IAppearancePreferences, ThemePreference } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AppearancePreferencesProps {
  preferences: IAppearancePreferences;
  onChange: (updated: Partial<IAppearancePreferences>) => void;
}

export function AppearancePreferences({
  preferences,
  onChange,
}: AppearancePreferencesProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    onChange({ theme: newTheme });
  };

  const currentTheme = preferences.theme || (theme as ThemePreference) || 'system';

  return (
    <SettingsSection
      title="Appearance"
      description="Choose your preferred portal theme across desktop and mobile devices."
    >
      <div className="grid grid-cols-3 gap-3">
        {/* Light */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleThemeChange('light')}
          className={cn(
            'flex flex-col items-center justify-center gap-2 h-20 p-2 rounded-lg border text-xs font-medium',
            currentTheme === 'light'
              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          )}
        >
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </Button>

        {/* Dark */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleThemeChange('dark')}
          className={cn(
            'flex flex-col items-center justify-center gap-2 h-20 p-2 rounded-lg border text-xs font-medium',
            currentTheme === 'dark'
              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          )}
        >
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </Button>

        {/* System */}
        <Button
          type="button"
          variant="outline"
          onClick={() => handleThemeChange('system')}
          className={cn(
            'flex flex-col items-center justify-center gap-2 h-20 p-2 rounded-lg border text-xs font-medium',
            currentTheme === 'system'
              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          )}
        >
          <Laptop className="h-5 w-5" />
          <span>System</span>
        </Button>
      </div>
    </SettingsSection>
  );
}
