'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/member/shared/member-avatar';
import { MemberProfile } from '@/lib/types/member';

export interface MemberUserMenuProps {
  member: MemberProfile;
}

export function MemberUserMenu({ member }: MemberUserMenuProps) {
  const router = useRouter();

  const handleSignOut = () => {
    // Placeholder sign out action for Phase 1
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-1.5 h-auto rounded-full hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary outline-none"
          aria-label={`Open user menu for ${member.displayName}`}
        >
          <MemberAvatar name={member.displayName} avatarUrl={member.avatarUrl} size="sm" />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
              {member.displayName}
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {member.membershipStatus}
            </span>
          </div>
          <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {member.displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {member.email}
            </p>
            <div className="flex items-center gap-1 pt-1 text-[11px] text-primary font-medium">
              <ShieldCheck className="h-3 w-3" />
              <span>{member.branch || member.campus}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/portal/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/portal/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
