import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

type Role = 'admin' | 'teacher' | 'hr';

interface AppState {
  isLoggedIn: boolean;
  isSidebarOpen: boolean;
  userRole: Role;
  currentUser: any; // Add current user info
  setIsLoggedIn: (status: boolean) => void;
  toggleSidebar: () => void;
  setUserRole: (role: Role) => void;
  setCurrentUser: (user: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isSidebarOpen: true,
      userRole: 'admin',
      currentUser: null,
      setIsLoggedIn: (status) => {
        if (status) {
          // 从 localStorage 获取 token 并设置到 Cookie
          const token = localStorage.getItem('auth_token');
          if (token) {
            Cookies.set('auth_token', token, { expires: 7 });
          }
        } else {
          // 登出时清除 Cookie 和 localStorage
          Cookies.remove('auth_token');
          localStorage.removeItem('auth_token');
        }
        set({ isLoggedIn: status, currentUser: null });
      },
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setUserRole: (role) => set({ userRole: role }),
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => {
        Cookies.remove('auth_token');
        localStorage.removeItem('auth_token');
        set({ isLoggedIn: false, currentUser: null, userRole: 'admin' });
      },
    }),
    {
      name: 'app-storage',
    }
  )
);
