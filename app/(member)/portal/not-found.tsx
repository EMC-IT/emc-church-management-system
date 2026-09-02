import { NotFoundView } from '@/components/errors';

export default function MemberPortalNotFound() {
  return (
    <NotFoundView
      scope="member"
      title="Member Page Not Found"
      description="The page, event, or member feature you are looking for may have been moved, updated, or is no longer available."
    />
  );
}
