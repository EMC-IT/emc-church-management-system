import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../services/auth/auth-service';

/**
 * The backend wraps every response in { success, data, message }, and axios
 * puts that whole body on `response.data`. The service therefore has to read
 * `response.data.data` to reach the payload.
 *
 * These pin that one indirection. Destructuring `response.data` instead stores
 * `undefined` as the auth token, which fails silently: login "succeeds", and
 * every later request goes out with `Authorization: Bearer undefined`.
 */

// vi.mock is hoisted above every other statement in the file, so the spies it
// closes over have to be hoisted too.
const { post, get, put } = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('../../services/api-client', () => ({
  default: { post, get, put },
}));

const store = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
});

const USER = {
  id: 'a3f1c2e4-0000-4000-8000-000000000001',
  email: 'admin@church.com',
  name: 'Admin User',
  role: {
    name: 'SuperAdmin',
    tenantId: 'tenant_emc_accra',
    branchId: 'branch_hq',
    permissions: ['members.view', 'dashboard.view'],
  },
  avatar: null,
  createdAt: '2026-01-21T10:30:00Z',
  updatedAt: '2026-01-21T10:30:00Z',
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';

/** Exactly what POST /auth/login returns, envelope included. */
const loginBody = {
  success: true,
  data: { user: USER, token: TOKEN },
  message: 'Login successful',
};

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe('authService.login', () => {
  it('stores the token from inside the response envelope', async () => {
    post.mockResolvedValue({ data: loginBody });

    await authService.login({ email: USER.email, password: 'password123' });

    expect(localStorage.getItem('token')).toBe(TOKEN);
  });

  it('never stores an undefined token', async () => {
    post.mockResolvedValue({ data: loginBody });

    await authService.login({ email: USER.email, password: 'password123' });

    expect(localStorage.getItem('token')).not.toBe('undefined');
    expect(localStorage.getItem('token')).toBeTruthy();
  });

  it('stores the user from inside the response envelope', async () => {
    post.mockResolvedValue({ data: loginBody });

    await authService.login({ email: USER.email, password: 'password123' });

    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(USER);
  });

  it('returns the payload, not the envelope', async () => {
    post.mockResolvedValue({ data: loginBody });

    const result = await authService.login({ email: USER.email, password: 'password123' });

    expect(result.data.token).toBe(TOKEN);
    expect(result.data.user).toEqual(USER);
    expect(result.data).not.toHaveProperty('success');
  });

  it('preserves the permissions array hasPermission() reads', async () => {
    post.mockResolvedValue({ data: loginBody });

    const result = await authService.login({ email: USER.email, password: 'password123' });

    expect(result.data.user.role.permissions).toEqual(['members.view', 'dashboard.view']);
  });

  it('reports the server message on failure without storing anything', async () => {
    post.mockRejectedValue({ response: { data: { message: 'Invalid email or password' } } });

    const result = await authService.login({ email: USER.email, password: 'wrong' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('authService.getCurrentUser', () => {
  it('unwraps the envelope GET /auth/me returns', async () => {
    get.mockResolvedValue({ data: { success: true, data: USER } });

    expect(await authService.getCurrentUser()).toEqual(USER);
  });

  it('returns null when the request fails', async () => {
    get.mockRejectedValue(new Error('401'));

    expect(await authService.getCurrentUser()).toBeNull();
  });
});

describe('authService.changePassword', () => {
  it('PUTs the documented body to the documented path', async () => {
    put.mockResolvedValue({ data: { success: true, message: 'Password changed successfully' } });

    await authService.changePassword({
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    });

    expect(put).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    });
  });
});
