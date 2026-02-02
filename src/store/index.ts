import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

type Role = 'admin' | 'teacher' | 'hr';

interface AppState {
  isLoggedIn: boolean;
  isSidebarOpen: boolean;
  userRole: Role;
  setIsLoggedIn: (status: boolean) => void;
  toggleSidebar: () => void;
  setUserRole: (role: Role) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isSidebarOpen: true,
      userRole: 'admin',
      setIsLoggedIn: (status) => {
        if (status) {
          Cookies.set('auth_token', 'true', { expires: 7 });
        } else {
          Cookies.remove('auth_token');
        }
        set({ isLoggedIn: status });
      },
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setUserRole: (role) => set({ userRole: role }),
    }),
    {
      name: 'app-storage',
    }
  )
);
