import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  FileText, 
  Users, 
  Search, 
  Plus, 
  History, 
  Settings, 
  Variable, 
  Clock, 
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

const mockTemplates: Template[] = [
  { id: '1', name: '面试邀请', subject: '【码绘工作室】{{姓名}}同学，诚邀您参加面试', content: '亲爱的{{姓名}}同学，你的简历已通过初筛，我们诚邀你参加面试...', category: '面试' },
  { id: '2', name: '通过通知', subject: '【码绘工作室】恭喜！{{姓名}}同学，你已通过面试', content: '亲爱的{{姓名}}同学，很高兴地通知你已经通过了面试，后续安排为...', category: '通过' },
  { id: '3', name: '不合适通知', subject: '关于码绘工作室招新进度的通知', content: '亲爱的{{姓名}}同学，感谢你投递我们的岗位，经过慎重考虑...', category: '拒信' },
];

export function EmailSystem() {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history' | 'config'>('send');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSend = () => {
    toast.success('群发任务已启动，飞书机器人将同步通知');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 w-fit rounded-xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'send', label: '群发邮件', icon: Send },
          { id: 'templates', label: '模版管理', icon: FileText },
          { id: 'history', label: '发送记录', icon: History },
          { id: 'config', label: '发信配置', icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'send' && (
          <>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2 tracking-tight">
                  <Mail className="w-5 h-5 text-blue-600" />
                  新建通知任务
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">选择模板</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold"
                      onChange={(e) => setSelectedTemplate(mockTemplates.find(t => t.id === e.target.value) || null)}
                    >
                      <option value="">-- 请选择邮件模板 --</option>
                      {mockTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">主题</label>
                    <input 
                      type="text" 
                      defaultValue={selectedTemplate?.subject || ''}
                      placeholder="输入通知标题..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">邮件正文</label>
                      <div className="flex gap-2">
                        {['姓名', '学号', '部门', '时间'].map(v => (
                          <button key={v} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] rounded font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                            + {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      rows={10}
                      defaultValue={selectedTemplate?.content || ''}
                      placeholder="输入通知内容..."
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        定时发送
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <Users className="w-3.5 h-3.5" />
                        已选 12 人
                      </div>
                    </div>
                    <button 
                      onClick={handleSend}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      开始群发
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black mb-6 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  收件人筛选
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">按面试状态</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['待面试', '面试通过', '未通过', '全选'].map(res => (
                        <button key={res} className="px-3 py-2 text-[10px] font-black uppercase border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all">
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">按部门</p>
                    <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none">
                      <option>全部部门</option>
                      <option>前端部</option>
                      <option>UI部</option>
                      <option>办公室</option>
                      <option>运维</option>
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">当前已选</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">12 人</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'config' && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black mb-8 tracking-tight uppercase">SMTP 发信配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SMTP 服务器</label>
                  <input type="text" defaultValue="smtp.mahui.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SMTP 端口</label>
                  <input type="text" defaultValue="465" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">发信账号</label>
                  <input type="text" defaultValue="hr@mahui.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">授权码/密码</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
              <button onClick={() => toast.success('配置已保存并测试成功')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                保存并测试
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map(template => (
              <div key={template.id} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all group shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
                    {template.category}
                  </span>
                  <button className="text-slate-300 hover:text-blue-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-black mb-4 tracking-tight">{template.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-3 mb-8 font-medium leading-relaxed">{template.content}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Updated: 2024-02-01</span>
                  <button className="text-[10px] font-black uppercase text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">Edit</button>
                </div>
              </div>
            ))}
            <button className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">New Template</span>
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">任务名称</th>
                  <th className="px-6 py-4">对象</th>
                  <th className="px-6 py-4">发送状态</th>
                  <th className="px-6 py-4">时间</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-bold">
                {[
                  { name: '2024春季面试邀请', targets: 'UI部 (5人)', success: '5/5', status: 'completed', time: '2024-02-01 14:00' },
                  { name: '前端一面结果通知', targets: '前端部 (12人)', success: '12/12', status: 'completed', time: '2024-01-28 10:00' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-5 text-sm font-black">{item.name}</td>
                    <td className="px-6 py-5 text-[10px] text-slate-400 uppercase">{item.targets}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 w-full"></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{item.success}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[10px] text-slate-400 uppercase font-black">{item.time}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-300 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
