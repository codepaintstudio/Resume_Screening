import { 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  Settings, 
  GraduationCap,
  Github
} from 'lucide-react';

export interface NavSubItem {
  id: string;
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  subItems?: NavSubItem[];
}

export const navItems: readonly NavItem[] = [
  { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
  { id: 'resumes', label: '招新简历库', icon: GraduationCap },
  { id: 'interviews', label: '面试安排', icon: Briefcase },
  { 
    id: 'emails', 
    label: '通知发送', 
    icon: Mail,
    subItems: [
      { id: 'batch', label: '群发邮件', href: '/emails?tab=batch' },
      { id: 'templates', label: '模版管理', href: '/emails?tab=templates' },
      { id: 'history', label: '发送记录', href: '/emails?tab=history' }
    ]
  },
  { id: 'github', label: 'GitHub 管理', icon: Github },
];
