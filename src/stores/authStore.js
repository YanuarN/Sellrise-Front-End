import { create } from 'zustand';
import authService from '../services/authService';
import api from '../services/api';

const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === 'true';
const DEV_FORCE_ADMIN_ROLE = import.meta.env.DEV && import.meta.env.VITE_DEV_FORCE_ADMIN_ROLE === 'true';

const DEV_USER = {
  id: 'dev-admin-user',
  email: 'dev-admin@sellrise.local',
  full_name: 'Dev Admin',
  role: 'admin',
  workspace_id: 'wk_dev_workspace',
};

const withDevAdminRole = (user) => {
  if (!user) return user;
  if (!DEV_FORCE_ADMIN_ROLE) return user;
  return { ...user, role: 'admin' };
};

const useAuthStore = create((set) => ({
  user: DEV_BYPASS_AUTH && DEV_FORCE_ADMIN_ROLE ? DEV_USER : null,
  isAuthenticated: DEV_BYPASS_AUTH,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ error: null, isLoading: true });
    try {
      await authService.login(email, password);
      const user = withDevAdminRole(await authService.getMe());
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  signup: async ({ fullName, email, password, workspaceName }) => {
    set({ error: null, isLoading: true });
    try {
      await authService.register({
        full_name: fullName,
        email,
        password,
        workspace_name: workspaceName,
      });
      const user = withDevAdminRole(await authService.getMe());
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ error: err.message || 'Sign up failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    } finally {
      api.setAccessToken(null);
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('access_token');

    set({ isLoading: true, error: null });

    if (DEV_BYPASS_AUTH && !token) {
      set({
        user: DEV_FORCE_ADMIN_ROLE ? DEV_USER : null,
        isLoading: false,
        isAuthenticated: true,
      });
      return;
    }

    try {
      if (!token) {
        const refreshed = await api.refreshToken();

        if (!refreshed) {
          throw new Error('No active session');
        }
      }

      const user = withDevAdminRole(await authService.getMe());
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      api.setAccessToken(null);
      if (DEV_BYPASS_AUTH) {
        set({
          user: DEV_FORCE_ADMIN_ROLE ? DEV_USER : null,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
