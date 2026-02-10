'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Search,
  Mail,
  Briefcase,
  Github,
  Moon,
  Laptop,
  Contact,
  Webhook,
  Bot,
  Layout,
  Key,
  Loader2
} from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/app/components/ui/command';
import { cn } from '@/lib/utils';
import { navItems } from '@/config/nav';
import { Student } from '@/types';

interface SearchItem {
  id: string;
  type: 'candidate' | 'page' | 'action';
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon: React.ElementType;
  action: (router: any) => void;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [candidates, setCandidates] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch candidates from backend API
  React.useEffect(() => {
    if (open && candidates.length === 0) {
      setLoading(true);
      fetch('/api/resumes')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCandidates(data);
          }
        })
        .catch(err => console.error('Failed to fetch candidates for search', err))
        .finally(() => setLoading(false));
    }
  }, [open, candidates.length]);

  // Helper to run action
  const runAction = React.useCallback((action: SearchItem['action']) => {
    setOpen(false);
    action(router);
  }, [router]);

  // Construct search data
  const searchData = React.useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. Pages from navItems
    navItems.forEach(item => {
      items.push({
        id: `nav-${item.id}`,
        type: 'page',
        title: item.label,
        subtitle: '跳转到页面',
        keywords: [item.label, 'page', 'daohang'],
        icon: item.icon as React.ElementType,
        action: (r) => r.push(`/${item.id}`),
      });

      if (item.subItems) {
        item.subItems.forEach(sub => {
          items.push({
            id: `nav-${item.id}-${sub.id}`,
            type: 'page',
            title: `${item.label} - ${sub.label}`,
            subtitle: '跳转到页面',
            keywords: [sub.label, item.label, 'page'],
            icon: item.icon as React.ElementType,
            action: (r) => r.push(sub.href),
          });
        });
      }
    });

    // 2. Settings Pages (Comprehensive)
    items.push(
      {
        id: 'settings-platform',
        type: 'page',
        title: '部门管理',
        subtitle: '系统设置',
        keywords: ['settings', 'department', 'bumen', 'manage'],
        icon: Layout,
        action: (r) => r.push('/settings?tab=platform'),
      },
      {
        id: 'settings-ai',
        type: 'page',
        title: 'AI 模型配置',
        subtitle: '系统设置',
        keywords: ['settings', 'ai', 'model', 'llm', 'vision'],
        icon: Bot,
        action: (r) => r.push('/settings?tab=ai'),
      },
      {
        id: 'settings-notifications',
        type: 'page',
        title: '飞书集成',
        subtitle: '系统设置',
        keywords: ['settings', 'feishu', 'lark', 'webhook', 'notification', 'tongzhi'],
        icon: Webhook,
        action: (r) => r.push('/settings?tab=notifications'),
      },
      {
        id: 'settings-resume-import',
        type: 'page',
        title: '简历获取设置',
        subtitle: '系统设置',
        keywords: ['settings', 'email', 'fetch', 'jianli', 'imap'],
        icon: Mail,
        action: (r) => r.push('/settings?tab=resume-import'),
      },
      {
        id: 'settings-github',
        type: 'page',
        title: 'GitHub 管理',
        subtitle: '系统设置',
        keywords: ['settings', 'github', 'manage', 'guanli', 'oauth'],
        icon: Github,
        action: (r) => r.push('/settings?tab=github'),
      },
      {
        id: 'settings-email-sending',
        type: 'page',
        title: '发信设置',
        subtitle: '系统设置',
        keywords: ['settings', 'email', 'send', 'fasong', 'smtp'],
        icon: Mail,
        action: (r) => r.push('/settings?tab=email-sending'),
      },
      {
        id: 'settings-keys',
        type: 'page',
        title: 'API 密钥',
        subtitle: '系统设置',
        keywords: ['settings', 'api', 'key', 'secret', 'miyao'],
        icon: Key,
        action: (r) => r.push('/settings?tab=keys'),
      }
    );

    // 3. Candidates (Real Data)
    candidates.forEach(c => {
      // Entry 1: Resume Bank
      items.push({
        id: `candidate-${c.id}-resume`,
        type: 'candidate',
        title: `${c.name}`,
        subtitle: `候选人档案 · ${c.department || '未分配'}`,
        keywords: [c.name, c.studentId, c.department, c.major, 'student', 'resume', 'jianli'],
        icon: Contact, 
        action: (r) => r.push(`/resumes?candidateId=${c.id}`),
      });

      // Entry 2: Interview Kanban
      items.push({
        id: `candidate-${c.id}-interview`,
        type: 'candidate',
        title: `${c.name}`,
        subtitle: `面试安排 · ${c.status}`,
        keywords: [c.name, c.studentId, 'interview', 'mianshi'],
        icon: Briefcase,
        action: (r) => r.push(`/interviews?candidateId=${c.id}`),
      });
    });

    // 4. Actions
    items.push({
      id: 'action-theme-dark',
      type: 'action',
      title: '切换到深色模式',
      keywords: ['dark', 'theme', 'mode', 'heiye'],
      icon: Moon,
      action: () => document.documentElement.classList.add('dark'),
    });
    
    return items;
  }, [candidates]);

  const groups = {
    candidate: searchData.filter(i => i.type === 'candidate'),
    page: searchData.filter(i => i.type === 'page'),
    action: searchData.filter(i => i.type === 'action'),
  };

  return (
    <>
      <div className="relative group">
        <Command 
          shouldFilter={true}
          className="rounded-xl border bg-slate-50 dark:bg-slate-800 overflow-visible border-none"
        >
          <div className="flex items-center px-3 border-none ring-0 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-full bg-slate-50 dark:bg-slate-800 transition-all w-48 group-focus-within:w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <CommandPrimitive.Input 
              placeholder="搜索成员、页面、设置..." 
              value={query}
              onValueChange={setQuery}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              className="h-9 py-1 text-sm bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-400 w-full" 
            />
            {loading && <Loader2 className="w-3 h-3 text-blue-500 animate-spin ml-2" />}
          </div>

          {open && query.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <CommandList className="max-h-[300px] overflow-y-auto py-2">
                <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                  {loading ? '正在搜索...' : '无相关搜索结果'}
                </CommandEmpty>

                {groups.candidate.length > 0 && (
                  <CommandGroup heading="候选人">
                    {groups.candidate.map(item => (
                      <CommandItem
                        key={item.id}
                        value={item.title + item.keywords?.join(' ')}
                        onSelect={() => runAction(item.action)}
                        className="cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.title}</span>
                            {item.subtitle && (
                              <span className="text-xs text-slate-500 truncate">{item.subtitle}</span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                <CommandSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                {groups.page.length > 0 && (
                  <CommandGroup heading="导航">
                    {groups.page.map(item => (
                      <CommandItem
                        key={item.id}
                        value={item.title + item.keywords?.join(' ')}
                        onSelect={() => runAction(item.action)}
                         className="cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                      >
                        <item.icon className="mr-2 h-4 w-4 text-slate-500" />
                        <span>{item.title}</span>
                        {item.subtitle && <span className="ml-2 text-xs text-slate-400">({item.subtitle})</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {groups.action.length > 0 && (
                  <CommandGroup heading="操作">
                    {groups.action.map(item => (
                      <CommandItem
                        key={item.id}
                        value={item.title + item.keywords?.join(' ')}
                        onSelect={() => runAction(item.action)}
                         className="cursor-pointer aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                      >
                        <item.icon className="mr-2 h-4 w-4 text-slate-500" />
                        <span>{item.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </div>
          )}
        </Command>
      </div>
    </>
  );
}
