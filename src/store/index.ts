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
          Cookies.set('auth_token', 'true', { expires: 7 });
        } else {
          Cookies.remove('auth_token');
          set({ currentUser: null });
        }
        set({ isLoggedIn: status });
      },
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setUserRole: (role) => set({ userRole: role }),
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: 'app-storage',
    }
  )
);
