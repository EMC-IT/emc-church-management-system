import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface WelcomeHeaderProps {
  profile: MemberProfile;
  className?: string;
}

export function WelcomeHeader({ profile, className }: WelcomeHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
        Welcome back, {profile.firstName}! 👋
      </h1>
      <p className="text-sm text-muted-foreground">
        We&apos;re glad to have you with us.
      </p>
    </div>
  );
}
