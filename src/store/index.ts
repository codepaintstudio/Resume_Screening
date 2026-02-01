import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Page = 'dashboard' | 'resumes' | 'interviews' | 'emails' | 'settings';
type Role = 'admin' | 'teacher' | 'hr';

interface AppState {
  isLoggedIn: boolean;
  currentPage: Page;
  isSidebarOpen: boolean;
  userRole: Role;
  theme: 'light' | 'dark';
  setIsLoggedIn: (status: boolean) => void;
  setCurrentPage: (page: Page) => void;
  toggleSidebar: () => void;
  setUserRole: (role: Role) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      currentPage: 'dashboard',
      isSidebarOpen: true,
      userRole: 'admin',
      theme: 'light',
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setCurrentPage: (page) => set({ currentPage: page }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setUserRole: (role) => set({ userRole: role }),
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme });
      },
    }),
    {
      name: 'app-storage',
      // 当 Store 从本地存储恢复时，同步 DOM 状态
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
