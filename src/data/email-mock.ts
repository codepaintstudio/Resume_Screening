
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export interface EmailHistoryItem {
  id: string;
  templateName: string;
  subject: string;
  content: string; // Snapshot of content
  recipients: { name: string; email?: string; status: string }[]; // Detailed recipient list
  recipientCount: number;
  status: 'success' | 'failed' | 'partial';
  sentAt: string;
}

// In-memory storage simulation (Note: This resets on server restart in dev mode)
// For a real app, use a database.
export interface EmailConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
}

let templates: EmailTemplate[] = [
  { id: '1', name: '面试邀请', subject: '【码绘工作室】{{姓名}}同学，诚邀您参加面试', content: '亲爱的{{姓名}}同学，你的简历已通过初筛，我们诚邀你参加面试...', category: '面试' },
  { id: '2', name: '通过通知', subject: '【码绘工作室】恭喜！{{姓名}}同学，你已通过面试', content: '亲爱的{{姓名}}同学，很高兴地通知你已经通过了面试，后续安排为...', category: '通过' },
  { id: '3', name: '不合适通知', subject: '关于码绘工作室招新进度的通知', content: '亲爱的{{姓名}}同学，感谢你投递我们的岗位，经过慎重考虑...', category: '拒信' },
];

let history: EmailHistoryItem[] = [
  { 
    id: '1', 
    templateName: '面试邀请', 
    subject: '【码绘工作室】邀请通知', 
    content: '亲爱的同学...', 
    recipients: [
      { name: '张三', status: 'sent' },
      { name: '李四', status: 'sent' }
    ],
    recipientCount: 12, 
    status: 'success', 
    sentAt: '2024-03-20 10:30' 
  },
  { 
    id: '2', 
    templateName: '不合适通知', 
    subject: '关于码绘工作室...', 
    content: '亲爱的同学...', 
    recipients: [
      { name: '王五', status: 'sent' }
    ],
    recipientCount: 5, 
    status: 'success', 
    sentAt: '2024-03-19 15:45' 
  },
];

let config: EmailConfig = {
  host: 'smtp.mahui.com',
  port: '465',
  user: 'hr@mahui.com',
  pass: ''
};

export const getTemplates = () => templates;
export const addTemplate = (t: EmailTemplate) => { templates.push(t); return t; };
export const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates };
    return templates[index];
  }
  return null;
};
export const deleteTemplate = (id: string) => { templates = templates.filter(t => t.id !== id); };

export const getHistory = () => history;
export const getHistoryById = (id: string) => history.find(h => h.id === id);
export const addHistory = (h: EmailHistoryItem) => { history.unshift(h); return h; };
export const deleteHistory = (id: string) => { history = history.filter(h => h.id !== id); };

export const getConfig = () => config;
export const updateConfig = (newConfig: EmailConfig) => { config = newConfig; return config; };
