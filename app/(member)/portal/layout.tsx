import { Metadata } from 'next';
import { MemberShell } from '@/components/member/layout';

export const metadata: Metadata = {
  title: {
    template: '%s | Member Portal — EMC Church',
    default: 'Member Portal — EMC Church',
  },
  description: 'Member portal and community management for EMC Church members',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MemberShell>{children}</MemberShell>;
}
