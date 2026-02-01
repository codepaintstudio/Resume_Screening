import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPageProps {
  role: 'admin' | 'teacher' | 'hr';
}

export function SettingsPage({ role }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<'personal' | 'platform' | 'ai' | 'notifications'>('personal');

  const handleSave = () => {
    toast.success('配置已保存并同步至服务器');
  };

  const sections = [
    { id: 'personal', label: '个人资料', icon: User },
    ...(role === 'admin' ? [
      { id: 'platform', label: '部门管理', icon: Layout },
      { id: 'ai', label: 'AI 模型设置', icon: Bot },
      { id: 'notifications', label: '飞书集成', icon: Webhook }
    ] : []),
  ];

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
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-xl font-black tracking-tight uppercase">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Management Console</p>
          </div>

          <div className="p-8">
            {activeSection === 'personal' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight">码绘主理人</h4>
                    <p className="text-sm text-slate-400 font-medium">admin@mahui.com</p>
                    <button className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">修改头像</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">显示名称</label>
                    <input type="text" defaultValue="张老师" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">修改密码</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm" />
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
                    {['前端部', 'UI部', '办公室', '运维'].map(dept => (
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
                      <input type="text" placeholder="https://api.provider.com/v1" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Name</label>
                        <input type="text" defaultValue="vision-vk-v2" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                        <input type="password" placeholder="sk-..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" />
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Provider</label>
                      <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm">
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google (Gemini)</option>
                        <option value="aliyun">Aliyun (Qwen)</option>
                        <option value="doubao">Doubao (ByteDance)</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="custom">Custom / Local (Ollama)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base URL (Optional)</label>
                      <input type="text" placeholder="https://api.openai.com/v1" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Name</label>
                      <input type="text" defaultValue="gpt-4-turbo" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" />
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
                      placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                    <input 
                      type="password" 
                      placeholder="Webhook 安全校验密钥" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-4 pt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">通知触发器</p>
                    <div className="space-y-2">
                      {['有新简历解析成功', '面试前1小时提醒', '录用结果确认'].map(event => (
                        <label key={event} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <span className="text-sm font-bold">{event}</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
