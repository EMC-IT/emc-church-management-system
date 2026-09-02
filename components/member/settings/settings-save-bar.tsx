'use client';

import { Check, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  className?: string;
}

export function SettingsSaveBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
  className,
}: SettingsSaveBarProps) {
  if (!isDirty) return null;

  return (
    <div
      className={cn(
        'sticky bottom-4 z-20 flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
        <span className="text-xs font-medium text-foreground">
          You have unsaved changes.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isSaving}
          onClick={onReset}
          className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={onSave}
          className="h-8 text-xs font-medium gap-1.5"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
