import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Settings as SettingsIcon, 
  Palette, 
  Bot, 
  Bell, 
  Key, 
  Layout,
  Trash2,
  Plus,
  Save,
  MessageSquare,
  Globe,
  Webhook,
  Zap,
  Eye,
  ChevronDown,
  Mail,
  Copy,
  Check,
  ChevronsUpDown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

import { Skeleton } from "@/app/components/ui/skeleton";

interface SettingsPageProps {
  role: 'admin' | 'teacher' | 'hr';
}

export function SettingsPage({ role }: SettingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'personal' | 'platform' | 'ai' | 'notifications' | 'resume-import'>('personal');
  
  // State for settings
  const [personal, setPersonal] = useState({
    avatar: '',
    displayName: '',
    email: '',
    department: ''
  });
  
  const [platform, setPlatform] = useState({
    departments: [] as string[]
  });

  const [ai, setAi] = useState({
    vision: { endpoint: '', model: '', apiKey: '' },
    llm: { baseUrl: '', apiKey: '', model: '' }
  });

  const [notifications, setNotifications] = useState({
    webhookUrl: '',
    triggers: {} as Record<string, boolean>
  });

  const [resumeImport, setResumeImport] = useState({
    imapServer: '',
    port: '',
    account: '',
    password: ''
  });

  const [apiKeys, setApiKeys] = useState<{id: string, name: string, key: string, created: string}[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [openModelSelect, setOpenModelSelect] = useState(false);
  
  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      
      setPersonal(data.personal || {});
      setPlatform(data.platform || { departments: [] });
      setAi(data.ai || { vision: {}, llm: {} });
      setNotifications(data.notifications || { triggers: {} });
      setResumeImport(data.resumeImport || {});
      setApiKeys(data.apiKeys || []);
      
      // Initialize available models if needed or fetch them
      if (data.ai?.llm?.baseUrl) {
        // We could fetch models here if we wanted to auto-load
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const promise = fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personal,
        platform,
        ai,
        notifications,
        resumeImport,
        apiKeys
      })
    });

    toast.promise(promise, {
      loading: '正在保存配置...',
      success: '配置已保存并同步至服务器',
      error: '保存失败'
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('密码修改成功');
        setIsPasswordDialogOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || '修改失败');
      }
    } catch (error) {
      toast.error('请求失败，请稍后重试');
    }
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_live_${Math.random().toString(36).substring(2)}`,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success('新的 API 密钥已生成');
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success('API 密钥已撤销');
  };

  const fetchModels = () => {
    const base = ai.llm.baseUrl.replace(/\/+$/, '');
    const endpoint =
      base.includes('openai.com') ? `${base}/models` :
      base.includes('openrouter.ai') ? `${base}/models` :
      base.includes('groq.com') ? `${base}/models` :
      base.includes('modelscope.cn') ? `${base}/models` :
      `${base}/models`;
    const headers: Record<string, string> = {};
    if (ai.llm.apiKey) headers['Authorization'] = `Bearer ${ai.llm.apiKey}`;
    
    // Only show loading toast if we don't have models yet, to avoid annoyance on re-open
    if (availableModels.length === 0) {
      toast.loading('正在获取模型列表...');
    }

    fetch(endpoint, { headers })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        const arr: any[] = Array.isArray((json as any).data) ? (json as any).data : Array.isArray(json) ? (json as any) : [];
        const names = arr.map((m: any) => m.id || m.model || m.name).filter(Boolean);
        if (names.length > 0) {
          setAvailableModels(names);
          // Do not auto-select the first model. Keep existing selection or empty.
          // setSelectedModel(names[0]); 
          
          if (availableModels.length === 0) {
             toast.dismiss();
             toast.success('模型列表已更新');
          }
        } else {
           if (availableModels.length === 0) {
             toast.dismiss();
             toast.error('未获取到模型列表');
           }
        }
      })
      .catch(() => {
        if (availableModels.length === 0) {
          toast.dismiss();
          toast.error('获取失败');
        }
      });
  };

  const sections = [
    { id: 'personal', label: '个人资料', icon: User },
    ...(role === 'admin' ? [
      { id: 'platform', label: '部门管理', icon: Layout },
      { id: 'ai', label: 'AI 模型设置', icon: Bot },
      { id: 'notifications', label: '飞书集成', icon: Webhook },
      { id: 'resume-import', label: '简历获取', icon: Mail }
    ] : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Loading Skeleton */}
        <aside className="w-full lg:w-64 space-y-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </aside>

        {/* Content Loading Skeleton */}
        <div className="flex-1 max-w-3xl space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-6">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-64 space-y-1">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
              activeSection === section.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 border-transparent hover:border-slate-100 dark:hover:border-slate-800'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </aside>

      {/* Content Area */}
      <div className="flex-1 max-w-3xl space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">
                {sections.find(s => s.id === activeSection)?.label}
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Management Console</p>
            </div>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>

          <div className="p-8">
            {activeSection === 'personal' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                    <img src={personal.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight">{personal.displayName || 'User'}</h4>
                    <p className="text-sm text-slate-400 font-medium">{personal.email || 'email@example.com'}</p>
                    <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">修改头像</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">显示名称</label>
                    <input 
                      type="text" 
                      value={personal.displayName} 
                      onChange={(e) => setPersonal({...personal, displayName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">所属部门</label>
                    <input 
                      type="text" 
                      value={personal.department} 
                      onChange={(e) => setPersonal({...personal, department: e.target.value})}
                      placeholder="e.g. 技术部"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">账号安全</label>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                          <span className="font-bold text-sm text-slate-600 dark:text-slate-300">修改登录密码</span>
                          <Key className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>修改密码</DialogTitle>
                          <DialogDescription>
                            为了您的账号安全，建议定期更换密码。
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">当前密码</label>
                            <input 
                              type="password" 
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">新密码</label>
                            <input 
                              type="password" 
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">确认新密码</label>
                            <input 
                              type="password" 
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md" 
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>取消</Button>
                          <Button onClick={handleChangePassword}>确认修改</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'platform' && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">部门配置</h4>
                    <button className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Dept
                    </button>
                  </div>
                  <div className="space-y-2">
                    {platform.departments.map(dept => (
                      <div key={dept} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl group transition-all">
                        <span className="text-sm font-black">{dept}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"><SettingsIcon className="w-4 h-4" /></button>
                          <button className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="space-y-8">
                {/* Vision Model Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tight">视觉识别模型 (VK Model)</h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-500 font-bold uppercase mt-0.5">用于从附件图片/PDF中提取视觉结构</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Endpoint</label>
                      <input 
                        type="text" 
                        value={ai.vision.endpoint}
                        onChange={(e) => setAi({...ai, vision: {...ai.vision, endpoint: e.target.value}})}
                        placeholder="https://api.provider.com/v1" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Name</label>
                        <input 
                          type="text" 
                          value={ai.vision.model}
                          onChange={(e) => setAi({...ai, vision: {...ai.vision, model: e.target.value}})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                        <input 
                          type="password" 
                          value={ai.vision.apiKey}
                          onChange={(e) => setAi({...ai, vision: {...ai.vision, apiKey: e.target.value}})}
                          placeholder="sk-..." 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                {/* LLM Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">语义逻辑模型 (LLM)</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase mt-0.5">用于简历内容的深度理解与部门匹配</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base URL</label>
                      <input
                        type="text"
                        value={ai.llm.baseUrl}
                        onChange={(e) => setAi({...ai, llm: {...ai.llm, baseUrl: e.target.value}})}
                        placeholder="https://api.openai.com/v1"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                      <input
                        type="password"
                        value={ai.llm.apiKey}
                        onChange={(e) => setAi({...ai, llm: {...ai.llm, apiKey: e.target.value}})}
                        placeholder="sk-..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Name</label>
                      <Popover open={openModelSelect} onOpenChange={(open) => {
                        setOpenModelSelect(open);
                        if (open) fetchModels();
                      }}>
                        <PopoverTrigger asChild>
                          <div className="relative">
                             <input
                                type="text"
                                value={ai.llm.model}
                                onChange={(e) => setAi({...ai, llm: {...ai.llm, model: e.target.value}})}
                                placeholder="Select or enter model"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm pr-10"
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                               <ChevronsUpDown className="w-4 h-4" />
                             </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command>
                            <CommandList>
                               {availableModels.length === 0 && <CommandEmpty>No models found.</CommandEmpty>}
                               <CommandGroup>
                                  {availableModels
                                    .filter(model => model.toLowerCase().includes(ai.llm.model.toLowerCase()))
                                    .map((model) => (
                                    <CommandItem
                                     key={model}
                                     value={model}
                                     onSelect={(currentValue) => {
                                       setAi({...ai, llm: {...ai.llm, model: currentValue}});
                                       setOpenModelSelect(false);
                                     }}
                                   >
                                     <Check
                                       className={`mr-2 h-4 w-4 ${ai.llm.model === model ? "opacity-100" : "opacity-0"}`}
                                     />
                                     {model}
                                   </CommandItem>
                                 ))}
                               </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div className="p-6 bg-[#00d6b9]/10 rounded-2xl border border-[#00d6b9]/20 flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#00d6b9] rounded-2xl flex items-center justify-center text-white">
                    <Webhook className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight text-[#009b85]">飞书机器人集成</h4>
                    <p className="text-sm text-slate-500 font-medium">配置 Webhook 实现自动同步面试安排至飞书群聊。</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook URL</label>
                    <input 
                      type="text" 
                      value={notifications.webhookUrl}
                      onChange={(e) => setNotifications({...notifications, webhookUrl: e.target.value})}
                      placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">通知触发器</p>
                    <div className="space-y-2">
                      {[
                        { key: 'new_resume', label: '有新简历解析成功' },
                        { key: 'interview_reminder', label: '面试前1小时提醒' },
                        { key: 'offer_confirmed', label: '录用结果确认' }
                      ].map(trigger => (
                        <label key={trigger.key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-sm font-bold">{trigger.label}</span>
                          <input 
                            type="checkbox" 
                            checked={notifications.triggers?.[trigger.key] || false}
                            onChange={(e) => setNotifications({
                              ...notifications, 
                              triggers: {
                                ...notifications.triggers,
                                [trigger.key]: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'resume-import' && (
              <div className="space-y-8">
                {/* IMAP Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight">邮箱 IMAP 导入</h4>
                      <p className="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase mt-0.5">自动从指定邮箱抓取并解析简历邮件</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMAP Server</label>
                      <input 
                        type="text" 
                        value={resumeImport.imapServer || ''}
                        onChange={(e) => setResumeImport({...resumeImport, imapServer: e.target.value})}
                        placeholder="imap.exmail.qq.com" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port</label>
                      <input 
                        type="text" 
                        value={resumeImport.port || ''}
                        onChange={(e) => setResumeImport({...resumeImport, port: e.target.value})}
                        placeholder="993" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Account</label>
                      <input 
                        type="email" 
                        value={resumeImport.account || ''}
                        onChange={(e) => setResumeImport({...resumeImport, account: e.target.value})}
                        placeholder="hr@company.com" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password / App Token</label>
                      <input 
                        type="password" 
                        value={resumeImport.password || ''}
                        onChange={(e) => setResumeImport({...resumeImport, password: e.target.value})}
                        placeholder="••••••••" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="ssl" 
                      checked={resumeImport.ssl !== false}
                      onChange={(e) => setResumeImport({...resumeImport, ssl: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <label htmlFor="ssl" className="text-sm font-bold text-slate-600 dark:text-slate-400">启用 SSL/TLS 安全连接</label>
                  </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

                {/* API Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">API Access</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Manage access keys for external uploads</p>
                      </div>
                    </div>
                    <button 
                      onClick={generateApiKey}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-violet-700 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Generate Key
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{key.name}</span>
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500">{key.created}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
                              {key.key}
                            </code>
                            <button className="text-slate-400 hover:text-blue-600 transition-colors">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => revokeApiKey(key.id)}
                          className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl text-rose-500 transition-colors"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {apiKeys.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No active API keys
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Endpoint</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value="https://api.mahui.com/v1/resume/upload" 
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold text-sm text-slate-500" 
                      />
                      <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

          </div>

          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end hidden">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
