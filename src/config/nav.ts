import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  Settings, 
  GraduationCap 
} from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'resumes', label: '招新简历库', icon: GraduationCap },
  { id: 'interviews', label: '面试安排', icon: Briefcase },
  { id: 'emails', label: '通知发送', icon: Mail },
  { id: 'settings', label: '工作室设置', icon: Settings },
] as const;
