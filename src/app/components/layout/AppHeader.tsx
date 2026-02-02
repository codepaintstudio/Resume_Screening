import { 
  Search, 
  Bell, 
  Sun,
  Moon,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/nav';
import { NotificationsPopover } from './NotificationsPopover';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (event: React.MouseEvent) => {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // @ts-ignore
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const isSwitchingToDark = nextTheme === 'dark';
    // Add stable class to control z-index independently of theme toggle
    const transitionClass = isSwitchingToDark ? 'animating-to-dark' : 'animating-to-light';
    document.documentElement.classList.add(transitionClass);

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      // Disable global CSS transitions to ensure the "New Snapshot" captures the final state immediately
      document.documentElement.classList.add('no-transition');
      
      flushSync(() => {
        setTheme(nextTheme);
      });
      // Force DOM update and ensure no flicker by validating class presence immediately
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });

    transition.finished.finally(() => {
      // Re-enable global CSS transitions and remove transition helper class
      document.documentElement.classList.remove('no-transition');
      document.documentElement.classList.remove(transitionClass);
    });

    transition.ready.then(() => {
      const isSwitchingToDark = nextTheme === 'dark';
      
      // Animation Configuration
      // Case 1: Light -> Dark (Standard Expand)
      // New View (Dark) expands from circle(0) to circle(100)
      if (isSwitchingToDark) {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        
        document.documentElement.animate(
          { clipPath },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      } 
      // Case 2: Dark -> Light (Inverted Shrink / Donut Closing)
      // New View (White) is on TOP.
      // We want to visually see the Black circle shrinking.
      // This means the White layer has a HOLE that shrinks.
      else {
        // Construct SVG Paths for "Rect with Hole"
        // Outer Rect (Clockwise)
        // Inner Circle (Counter-Clockwise) -> Creates Hole
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Outer Rectangle Path (Cover whole screen)
        // M 0 0 L w 0 L w h L 0 h Z
        const outerRect = `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
        
        // Inner Circle Path (Hole) - Counter-Clockwise (Sweep Flag 0)
        // M cx cy-r A r r 0 1 0 cx cy+r A r r 0 1 0 cx cy-r
        const createHole = (r: number) => {
          // Avoid r=0 issues in SVG path (can cause artifacts), use 0.1
          const radius = Math.max(0.1, r);
          return `M ${x} ${y - radius} A ${radius} ${radius} 0 1 0 ${x} ${y + radius} A ${radius} ${radius} 0 1 0 ${x} ${y - radius}`;
        };

        const startPath = `path('${outerRect} ${createHole(endRadius)}')`; // Big Hole (Visible Black)
        const endPath = `path('${outerRect} ${createHole(0)}')`; // No Hole (Full White)
        
        document.documentElement.animate(
          {
            clipPath: [startPath, endPath],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      }
    });
  };

  // Remove leading slash for matching
  const currentPath = pathname?.split('/')[1] || 'dashboard';
  const currentLabel = navItems.find(item => item.id === currentPath)?.label || '工作台';

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {currentLabel}
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
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
          title="切换主题"
        >
          {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationsPopover />

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
