import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { navItems } from '@/config/nav';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    setIsLoggedIn 
  } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-20 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center h-16 px-6 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover dark:hidden" />
              <img src="/logo-dark.png" alt="Logo" className="w-full h-full object-cover hidden dark:block" />
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-bold text-lg tracking-tight"
                >
                  码绘工作室
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(`/${item.id}`);
            return (
              <Link
                key={item.id}
                href={`/${item.id}`}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform", isActive ? 'scale-110' : 'group-hover:scale-110')} />
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isSidebarOpen && (
                  <div className="absolute left-16 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {isSidebarOpen && <span className="text-sm font-medium">收起侧边栏</span>}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-medium">退出登录</span>}
          </button>
        </div>
      </motion.aside>
  );
}
