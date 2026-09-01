import { StatusBadge, type StatusBadgeProps } from '@/components/ui/status-badge';

export interface MemberStatusProps extends Partial<StatusBadgeProps> {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MemberStatus({
  status,
  size = 'sm',
  className,
  ...props
}: MemberStatusProps) {
  return (
    <StatusBadge
      status={status}
      size={size}
      className={className}
      {...props}
    />
  );
}

