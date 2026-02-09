import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Bot, 
  Key, 
  Layout,
  Trash2,
  Plus,
  Save,
  Webhook,
  Zap,
  Eye,
  Mail,
  Copy,
  Check,
  ChevronsUpDown,
  Loader2,
  Lock,
  Github
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Switch } from "@/app/components/ui/switch";

interface SettingsPageProps {
  role: 'admin' | 'teacher' | 'hr';
}

export function SettingsPage({ role }: SettingsPageProps) {
  const [loading, setLoading] = useState(true);
  
  // State for settings
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
    password: '',
    ssl: true
  });

  const [github, setGithub] = useState({
    clientId: '',
    clientSecret: '',
    organization: '',
    personalAccessToken: ''
  });

  const [apiKeys, setApiKeys] = useState<{id: string, name: string, key: string, created: string, expiresAt?: string}[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [openModelSelect, setOpenModelSelect] = useState(false);
  
  // UI State
  const [newDeptName, setNewDeptName] = useState('');
  const [isAddDeptDialogOpen, setIsAddDeptDialogOpen] = useState(false);
  const [apiKeyExpiration, setApiKeyExpiration] = useState('never');
  
  useEffect(() => {
    if (role === 'admin') {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [role]);

  const fetchSettings = async () => {
    try {
      const [pl, a, n, r, k, g] = await Promise.all([
        fetch('/api/settings/platform').then(res => res.json()),
        fetch('/api/settings/ai').then(res => res.json()),
        fetch('/api/settings/notifications').then(res => res.json()),
        fetch('/api/settings/resume-import').then(res => res.json()),
        fetch('/api/settings/keys').then(res => res.json()),
        fetch('/api/settings/github').then(res => res.json())
      ]);
      
      setPlatform(pl || { departments: [] });
      setAi(a || { vision: {}, llm: {} });
      setNotifications(n || { triggers: {} });
      setResumeImport(r || {});
      setApiKeys(k || []);
      setGithub(g || { clientId: '', clientSecret: '', organization: '', personalAccessToken: '' });
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const promises = [
        fetch('/api/settings/platform', { method: 'PUT', body: JSON.stringify(platform) }),
        fetch('/api/settings/ai', { method: 'PUT', body: JSON.stringify(ai) }),
        fetch('/api/settings/notifications', { method: 'PUT', body: JSON.stringify(notifications) }),
        fetch('/api/settings/resume-import', { method: 'PUT', body: JSON.stringify(resumeImport) }),
        fetch('/api/settings/keys', { method: 'PUT', body: JSON.stringify(apiKeys) }),
        fetch('/api/settings/github', { method: 'PUT', body: JSON.stringify(github) })
    ];

    toast.promise(Promise.all(promises), {
      loading: '正在保存配置...',
      success: '系统配置已更新',
      error: '保存失败'
    });
  };

  const generateApiKey = async () => {
    try {
      const res = await fetch('/api/settings/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiration: apiKeyExpiration })
      });
      
      if (!res.ok) throw new Error('Failed to generate key');
      
      const newKey = await res.json();
      setApiKeys([...apiKeys, newKey]);
      toast.success('新的 API 密钥已生成');
    } catch (error) {
      toast.error('生成密钥失败');
    }
  };

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) {
      toast.error('部门名称不能为空');
      return;
    }
    if (platform.departments.includes(newDeptName.trim())) {
      toast.error('部门已存在');
      return;
    }
    setPlatform({
      ...platform,
      departments: [...platform.departments, newDeptName.trim()]
    });
    setNewDeptName('');
    setIsAddDeptDialogOpen(false);
    toast.success('部门已添加');
  };

  const handleRemoveDepartment = (deptToRemove: string) => {
    setPlatform({
      ...platform,
      departments: platform.departments.filter(d => d !== deptToRemove)
    });
    toast.success('部门已删除');
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

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">访问受限</h2>
          <p className="text-slate-500 mt-2">只有系统管理员可以访问此页面。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800">
            <div className="space-y-6">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">系统设置</h1>
          <p className="text-slate-500 text-sm mt-1">管理工作室平台参数、AI 模型与集成服务</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-slate-900/10 dark:shadow-none font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          保存配置
        </Button>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl mb-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="platform" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Layout className="w-4 h-4 mr-2" />
            部门管理
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Bot className="w-4 h-4 mr-2" />
            AI 模型
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Webhook className="w-4 h-4 mr-2" />
            飞书集成
          </TabsTrigger>
          <TabsTrigger value="resume-import" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Mail className="w-4 h-4 mr-2" />
            简历获取
          </TabsTrigger>
          <TabsTrigger value="github" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="keys" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm font-bold text-slate-500">
            <Key className="w-4 h-4 mr-2" />
            API 密钥
          </TabsTrigger>
        </TabsList>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <TabsContent value="platform" className="mt-0 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50 dark:border-slate-800">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">部门架构</h3>
                <p className="text-sm text-slate-500">管理工作室的部门分类，用于简历筛选和人员分配</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">当前部门列表</h4>
                <Dialog open={isAddDeptDialogOpen} onOpenChange={setIsAddDeptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700">
                      <Plus className="w-3 h-3 mr-1" />
                      新增部门
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>新增部门</DialogTitle>
                      <DialogDescription>
                        请输入要添加的部门名称。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-bold">
                          名称
                        </label>
                        <Input
                          id="name"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          className="col-span-3"
                          placeholder="例如：技术部"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddDepartment}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platform.departments.map(dept => (
                  <div key={dept} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl group transition-all hover:border-blue-200 dark:hover:border-blue-900">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dept}</span>
                    <button 
                      onClick={() => handleRemoveDepartment(dept)}
                      className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {platform.departments.length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    暂无部门配置
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0 space-y-10">
            {/* Vision Model Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">视觉识别模型 (Vision)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">用于从附件图片/PDF中提取视觉结构信息</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Endpoint</label>
                  <input 
                    type="text" 
                    value={ai.vision.endpoint}
                    onChange={(e) => setAi({...ai, vision: {...ai.vision, endpoint: e.target.value}})}
                    placeholder="https://api.provider.com/v1" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Name</label>
                  <input 
                    type="text" 
                    value={ai.vision.model}
                    onChange={(e) => setAi({...ai, vision: {...ai.vision, model: e.target.value}})}
                    placeholder="e.g. gpt-4-vision-preview"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={ai.vision.apiKey}
                      onChange={(e) => setAi({...ai, vision: {...ai.vision, apiKey: e.target.value}})}
                      placeholder="sk-..." 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800 ml-14"></div>

            {/* LLM Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">语义逻辑模型 (LLM)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">用于简历内容的深度理解、评估与部门匹配</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14">
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base URL</label>
                  <input
                    type="text"
                    value={ai.llm.baseUrl}
                    onChange={(e) => setAi({...ai, llm: {...ai.llm, baseUrl: e.target.value}})}
                    placeholder="https://api.openai.com/v1"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Key</label>
                  <input
                    type="password"
                    value={ai.llm.apiKey}
                    onChange={(e) => setAi({...ai, llm: {...ai.llm, apiKey: e.target.value}})}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Name</label>
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
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm pr-10 cursor-pointer"
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
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50 dark:border-slate-800">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600">
                <Webhook className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">飞书群组通知</h3>
                <p className="text-sm text-slate-500">配置 Webhook 实现自动同步面试安排与招聘动态至飞书群聊</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook URL</label>
                <input 
                  type="text" 
                  value={notifications.webhookUrl}
                  onChange={(e) => setNotifications({...notifications, webhookUrl: e.target.value})}
                  placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">通知触发条件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'new_resume', label: '有新简历解析成功' },
                    { key: 'interview_reminder', label: '面试前 1 小时提醒' },
                    { key: 'offer_confirmed', label: '录用结果确认' }
                  ].map(trigger => (
                    <div key={trigger.key} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{trigger.label}</span>
                      <Switch 
                        checked={notifications.triggers?.[trigger.key] || false}
                        onCheckedChange={(checked) => setNotifications({
                          ...notifications, 
                          triggers: {
                            ...notifications.triggers,
                            [trigger.key]: checked
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resume-import" className="mt-0 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50 dark:border-slate-800">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">邮箱自动导入</h3>
                <p className="text-sm text-slate-500">配置 IMAP 服务，自动从指定邮箱抓取并解析简历邮件</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IMAP Server</label>
                <input 
                  type="text" 
                  value={resumeImport.imapServer || ''}
                  onChange={(e) => setResumeImport({...resumeImport, imapServer: e.target.value})}
                  placeholder="imap.exmail.qq.com" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Port</label>
                <input 
                  type="text" 
                  value={resumeImport.port || ''}
                  onChange={(e) => setResumeImport({...resumeImport, port: e.target.value})}
                  placeholder="993" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Account</label>
                <input 
                  type="text" 
                  value={resumeImport.account || ''}
                  onChange={(e) => setResumeImport({...resumeImport, account: e.target.value})}
                  placeholder="hr@example.com" 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={resumeImport.password || ''}
                    onChange={(e) => setResumeImport({...resumeImport, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch 
                  id="ssl-mode" 
                  checked={resumeImport.ssl !== false}
                  onCheckedChange={(checked) => setResumeImport({...resumeImport, ssl: checked})}
                />
                <label htmlFor="ssl-mode" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  启用 SSL 安全连接
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="github" className="mt-0 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50 dark:border-slate-800">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white/10 rounded-xl flex items-center justify-center text-white dark:text-white">
                <Github className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">GitHub 集成</h3>
                <p className="text-sm text-slate-500">配置 GitHub OAuth 登录和组织成员管理功能</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  OAuth 应用配置
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client ID</label>
                    <input 
                      type="text" 
                      value={github.clientId || ''}
                      onChange={(e) => setGithub({...github, clientId: e.target.value})}
                      placeholder="Iv1..." 
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Secret</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={github.clientSecret || ''}
                        onChange={(e) => setGithub({...github, clientSecret: e.target.value})}
                        placeholder="••••••••" 
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Layout className="w-4 h-4 text-slate-500" />
                  组织管理配置
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Organization Name</label>
                    <input 
                      type="text" 
                      value={github.organization || ''}
                      onChange={(e) => setGithub({...github, organization: e.target.value})}
                      placeholder="mahui-studio" 
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Access Token</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={github.personalAccessToken || ''}
                        onChange={(e) => setGithub({...github, personalAccessToken: e.target.value})}
                        placeholder="ghp_..." 
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:border-slate-100 transition-all font-medium text-sm" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keys" className="mt-0 space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center text-violet-600">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">API 访问密钥</h3>
                  <p className="text-sm text-slate-500">管理外部系统调用简历上传接口的访问权限</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <Select value={apiKeyExpiration} onValueChange={setApiKeyExpiration}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="选择有效期" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">永久有效</SelectItem>
                      <SelectItem value="30">30 天</SelectItem>
                      <SelectItem value="60">60 天</SelectItem>
                      <SelectItem value="90">90 天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={generateApiKey}
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  生成新密钥
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Upload Endpoint</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value="https://api.mahui.com/v1/resume/upload" 
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-sm text-slate-500" 
                  />
                  <Button
                    variant="outline"
                    className="shrink-0 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                    onClick={() => {
                        navigator.clipboard.writeText("https://api.mahui.com/v1/resume/upload");
                        toast.success('已复制到剪贴板');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="flex-1">Key Name</div>
                  <div className="w-24">Created</div>
                  <div className="w-24">Expires</div>
                  <div className="w-20 text-right">Action</div>
                </div>
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-200">{key.name}</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                          {key.key}
                        </code>
                        <button 
                          className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                          onClick={() => {
                            navigator.clipboard.writeText(key.key);
                            toast.success('已复制到剪贴板');
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-24 text-sm text-slate-500">{key.created}</div>
                    <div className="w-24 text-sm text-slate-500">{key.expiresAt || 'Never'}</div>
                    <div className="w-20 text-right">
                      <button 
                        onClick={() => revokeApiKey(key.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg text-rose-500 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    暂无有效 API 密钥
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
