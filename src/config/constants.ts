import { Star, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';

export const DEPARTMENTS = ['全部部门', '前端部', 'UI部', '运维', '办公室'] as const;

export const AVAILABLE_INTERVIEWERS = ['张静', '李雷', '王武', '赵六', '孙七'];

export const STATUS_MAP = {
  pending: { label: '待处理', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  pending_interview: { label: '待面试', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  interviewing: { label: '面试中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  passed: { label: '面试通过', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: '不合适', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
} as const;

export type SortOptionId = 'ai' | 'gpa' | 'time' | 'status';

export const SORT_OPTIONS: { id: SortOptionId; label: string; icon: any }[] = [
  { id: 'ai', label: 'AI评分', icon: Star },
  { id: 'gpa', label: 'GPA', icon: GraduationCap },
  { id: 'time', label: '时间', icon: Clock },
  { id: 'status', label: '状态', icon: CheckCircle2 }
];

export const TABLE_HEADERS = [
  { label: '候选人', className: 'text-left' },
  { label: 'AI 评分', className: 'text-center' },
  { label: '学号 / 部门', className: 'text-left' },
  { label: '投递时间', className: 'text-left' },
  { label: 'GPA', className: 'text-center' },
  { label: '状态', className: 'text-left' },
  { label: '操作', className: 'text-right' },
] as const;
