import { 
  Search, 
  Bell, 
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { navItems } from '@/config/nav';

export function AppHeader() {
  const { currentPage, theme, setTheme } = useAppStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {navItems.find(item => item.id === currentPage)?.label}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex relative mr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索成员、简历..." 
            className="pl-10 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-full text-sm w-48 focus:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
        
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          title="切换主题"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button className="p-2 relative hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-1"></div>

        <div className="flex items-center gap-3 ml-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">主理人</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Admin</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" 
            alt="Admin" 
            className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
