import { describe, it, expect } from 'vitest';
import {
  memberNavigation,
  mobileBottomNavItems,
  isRouteActive,
} from '@/lib/navigation/member-navigation';
import { formatCurrency, CURRENCIES } from '@/lib/utils';
import { getStatusBadgeVariant, normalizeStatus } from '@/lib/status-badge';
import { parseDateValue } from '@/lib/date-utils';

describe('Member Portal — Phase 13: Cross-Portal Consistency & Integration', () => {
  describe('Navigation Architecture & Route Matching', () => {
    it('should declare all standardized section groups', () => {
      const titles = memberNavigation.map((g) => g.title).filter(Boolean);
      expect(titles).toEqual([
        'MY PROFILE',
        'MY CHURCH',
        'MY JOURNEY',
        'CARE',
        'RESOURCES',
        'COMMUNICATION',
        'SETTINGS',
      ]);
    });

    it('should include all required member portal destinations', () => {
      const allHrefs = memberNavigation.flatMap((g) => g.items.map((i) => i.href));
      expect(allHrefs).toContain('/portal');
      expect(allHrefs).toContain('/portal/profile');
      expect(allHrefs).toContain('/portal/family');
      expect(allHrefs).toContain('/portal/attendance');
      expect(allHrefs).toContain('/portal/giving');
      expect(allHrefs).toContain('/portal/groups');
      expect(allHrefs).toContain('/portal/ministries');
      expect(allHrefs).toContain('/portal/events');
      expect(allHrefs).toContain('/portal/journey');
      expect(allHrefs).toContain('/portal/prayer');
      expect(allHrefs).toContain('/portal/pastoral-care');
      expect(allHrefs).toContain('/portal/resources');
      expect(allHrefs).toContain('/portal/notifications');
      expect(allHrefs).toContain('/portal/settings');
    });

    it('should define mobile bottom navigation with 4 primary targets', () => {
      expect(mobileBottomNavItems).toHaveLength(4);
      expect(mobileBottomNavItems.map((i) => i.label)).toEqual([
        'Home',
        'Church',
        'Care',
        'Me',
      ]);
    });

    it('should correctly match active states for root and nested routes', () => {
      // Root portal
      expect(isRouteActive('/portal', '/portal', true)).toBe(true);
      expect(isRouteActive('/portal/events', '/portal', true)).toBe(false);
      expect(isRouteActive('/portal/events', '/portal', false)).toBe(false);

      // Top level match
      expect(isRouteActive('/portal/events', '/portal/events')).toBe(true);
      expect(isRouteActive('/portal/prayer', '/portal/prayer')).toBe(true);

      // Nested child route match
      expect(isRouteActive('/portal/events/evt-001', '/portal/events')).toBe(true);
      expect(isRouteActive('/portal/events/evt-001/register', '/portal/events')).toBe(true);
      expect(isRouteActive('/portal/prayer/new', '/portal/prayer')).toBe(true);
      expect(isRouteActive('/portal/pastoral-care/request', '/portal/pastoral-care')).toBe(true);

      // Negative match
      expect(isRouteActive('/portal/giving', '/portal/events')).toBe(false);
      expect(isRouteActive('/portal/profile', '/portal/family')).toBe(false);
      expect(isRouteActive(null, '/portal/events')).toBe(false);
    });
  });

  describe('Centralized Utilities & Formatting', () => {
    it('should format currencies accurately with correct symbols', () => {
      expect(CURRENCIES.USD.symbol).toBe('$');
      expect(CURRENCIES.GHS.symbol).toBe('₵');
      expect(CURRENCIES.EUR.symbol).toBe('€');
      expect(CURRENCIES.GBP.symbol).toBe('£');

      const formattedGHS = formatCurrency(250.5, 'GHS');
      expect(formattedGHS).toContain('250.50');
      expect(formattedGHS).toContain('₵');

      const formattedUSD = formatCurrency(100, 'USD');
      expect(formattedUSD).toContain('$100.00');
    });

    it('should parse date values consistently without drift', () => {
      const parsedIso = parseDateValue('2026-09-06');
      expect(parsedIso).toBeDefined();
      expect(parsedIso?.getFullYear()).toBe(2026);
      expect(parsedIso?.getMonth()).toBe(8); // September = index 8
      expect(parsedIso?.getDate()).toBe(6);
    });
  });

  describe('Semantic Status Badges', () => {
    it('should normalize status strings cleanly', () => {
      expect(normalizeStatus('Registered')).toBe('registered');
      expect(normalizeStatus('In Progress')).toBe('in_progress');
      expect(normalizeStatus('Awaiting Review')).toBe('awaiting_review');
    });

    it('should resolve semantic badge color variants consistently', () => {
      expect(getStatusBadgeVariant('registered')).toBe('success');
      expect(getStatusBadgeVariant('completed')).toBe('success');
      expect(getStatusBadgeVariant('answered')).toBe('success');
      expect(getStatusBadgeVariant('active')).toBe('primary');

      expect(getStatusBadgeVariant('pending')).toBe('warning');
      expect(getStatusBadgeVariant('requested')).toBe('warning');
      expect(getStatusBadgeVariant('waitlisted')).toBe('warning');

      expect(getStatusBadgeVariant('cancelled')).toBe('danger');
      expect(getStatusBadgeVariant('absent')).toBe('danger');
      expect(getStatusBadgeVariant('urgent')).toBe('danger');

      expect(getStatusBadgeVariant('praying')).toBe('info');
      expect(getStatusBadgeVariant('in_progress')).toBe('info');
      expect(getStatusBadgeVariant('scheduled')).toBe('info');

      expect(getStatusBadgeVariant('inactive')).toBe('neutral');
      expect(getStatusBadgeVariant('member')).toBe('neutral');
    });
  });
});
