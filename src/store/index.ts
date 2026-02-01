import { create } from 'zustand';

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

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  currentPage: 'dashboard',
  isSidebarOpen: true,
  userRole: 'admin',
  theme: 'light',
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setUserRole: (role) => set({ userRole: role }),
  setTheme: (theme) => set({ theme }),
}));
