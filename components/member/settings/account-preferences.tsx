'use client';

import Link from 'next/link';
import { User, HelpCircle, ArrowRight } from 'lucide-react';
import { SettingsSection } from './settings-section';

export function AccountPreferences() {
  return (
    <SettingsSection
      title="Account & Church Support"
      description="Manage your complete church membership profile and contact the administrative office."
    >
      <div className="divide-y divide-border/30">
        <Link
          href="/portal/profile"
          className="flex items-center justify-between py-3 group first:pt-0"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:text-primary transition-colors">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                Membership Profile & Family Records
              </span>
              <p className="text-[11px] text-muted-foreground">
                View personal contact details, marital status, and family members.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </Link>

        <div className="flex items-center justify-between py-3 last:pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Church Secretariat & Support
              </span>
              <p className="text-[11px] text-muted-foreground">
                For legal name updates or membership transfers, contact the church office.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            office@emc.org
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}
