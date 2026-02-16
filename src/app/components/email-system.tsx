import React, { useState, useEffect } from 'react';
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
  Settings2,
  Trash2,
  Edit,
  Save,
  RefreshCcw,
  Eye,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { cn } from "@/app/components/ui/utils";
import { useAppStore } from '@/store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: number | string;
  name: string;
  subject: string;
  content: string;
  category: string;
}

export function EmailSystem() {
  const { currentUser } = useAppStore();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'batch';
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Template Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({
    category: '面试',
    name: '',
    subject: '',
    content: ''
  });

  const [history, setHistory] = useState<any[]>([]);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  
  // Candidate Filter State
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<number | string>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    time: 'all'
  });

  useEffect(() => {
    fetchTemplates();
    fetchHistory();
    fetchCandidates();
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const res = await fetch('/api/settings/email-sending');
      const data = await res.json();
      if (!data.host || !data.user || !data.pass) {
        setConfigMissing(true);
      } else {
        setConfigMissing(false);
      }
    } catch (error) {
      console.error('Failed to check email config', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/resumes');
      const result = await res.json();
      // 处理分页格式的响应
      const candidatesData = Array.isArray(result) ? result : (result.data || []);
      setCandidates(candidatesData);
    } catch (error) {
      console.error('Failed to fetch candidates', error);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchDept = filters.department === 'all' || c.department === filters.department;
    
    let matchStatus = true;
    if (filters.status !== 'all') {
       if (filters.status === '待面试') matchStatus = ['pending', 'to_be_scheduled', 'pending_interview'].includes(c.status);
       else if (filters.status === '面试通过') matchStatus = c.status === 'passed';
       else if (filters.status === '未通过') matchStatus = c.status === 'rejected';
    }
  
    const matchTime = (() => {
        if (filters.time === 'all') return true;
        
        const date = new Date(c.submissionDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (filters.time === '3days') return diffDays <= 3;
        if (filters.time === 'week') return diffDays <= 7;
        if (filters.time === 'month') return diffDays <= 30;

        if (filters.time === 'custom' && dateRange?.from) {
            const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
            const toDate = dateRange.to 
                ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate())
                : fromDate;
            return targetDate >= fromDate && targetDate <= toDate;
        }

        return true;
    })();
  
    return matchDept && matchStatus && matchTime;
  });

  // Toggle candidate selection
  const toggleCandidate = (id: number | string) => {
    setSelectedCandidateIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all filtered candidates
  const selectAllCandidates = () => {
    setSelectedCandidateIds(new Set(filteredCandidates.map(c => c.id)));
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedCandidateIds(new Set());
  };

  // Get selected candidates data
  const selectedCandidates = candidates.filter(c => selectedCandidateIds.has(c.id));

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/emails/templates');
      const data = await res.json();
      // 确保 ID 转换为字符串以保持兼容性
      const templatesWithStringId = (Array.isArray(data) ? data : []).map((t: any) => ({
        ...t,
        id: String(t.id)
      }));
      setTemplates(templatesWithStringId);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/emails/history');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const handleSend = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('请先选择收件人');
      return;
    }

    if (!selectedTemplate) {
      toast.error('请先选择邮件模板');
      return;
    }

    setIsLoading(true);
    try {
      // 构建收件人列表
      const recipients = selectedCandidates.map(c => ({
        name: c.name,
        email: c.email
      }));

      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate?.id,
          recipients: recipients,
          customSubject: selectedTemplate ? undefined : 'Custom Subject',
          customContent: selectedTemplate ? undefined : 'Custom Content',
          user: currentUser
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`成功发送 ${data.message || selectedCandidates.length + ' 封邮件'}`);
        fetchHistory(); // Refresh history
        clearSelections(); // 发送成功后清除选择
      } else {
        toast.error(data.message || '发送失败');
      }
    } catch (error) {
      toast.error('发送出错');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('确定删除这条发送记录吗？')) return;
    try {
      const res = await fetch(`/api/emails/history/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHistory(history.filter(h => h.id !== id));
        toast.success('记录已删除');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleViewDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/emails/history/${id}`);
      if (!res.ok) throw new Error('Failed to fetch details');
      const data = await res.json();
      setViewingHistoryItem(data);
    } catch (error) {
      toast.error('获取详情失败');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentTemplate({ category: '面试', name: '', subject: '', content: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (template: Template) => {
    setIsEditing(true);
    setCurrentTemplate({ ...template });
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.content) {
      toast.error('请填写完整模板信息');
      return;
    }

    try {
      const url = isEditing && currentTemplate.id 
        ? `/api/emails/templates/${currentTemplate.id}`
        : '/api/emails/templates';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTemplate)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(isEditing ? '模板更新成功' : '模板创建成功');
        fetchTemplates();
        setIsDialogOpen(false);
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作出错');
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除该模板吗？')) return;
    try {
      const res = await fetch(`/api/emails/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTemplates(templates.filter(t => t.id !== id));
        toast.success('模板已删除');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'batch' && (
          configMissing ? (
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">未配置发信服务</h3>
              <p className="text-slate-500 mb-8 max-w-md text-center">
                请先前往系统设置配置 SMTP 服务，配置完成后即可开始群发通知。
              </p>
              <Link href="/settings?tab=email-sending">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  <Settings className="w-4 h-4" />
                  前往配置
                </button>
              </Link>
            </div>
          ) : (
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
                    <Select onValueChange={(val) => setSelectedTemplate(templates.find(t => t.id === val) || null)}>
                      <SelectTrigger className="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="-- 请选择邮件模板 --" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        已选 {filteredCandidates.length} 人
                      </div>
                    </div>
                    <button 
                      onClick={handleSend}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '发送中...' : (
                        <>
                          <Send className="w-4 h-4" />
                          开始群发
                        </>
                      )}
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
                      {['全选', '待面试', '面试通过', '未通过'].map(res => (
                        <button 
                            key={res} 
                            onClick={() => setFilters({...filters, status: res === '全选' ? 'all' : res})}
                            className={`px-3 py-2 text-[10px] font-black uppercase border rounded-xl transition-all ${
                                (filters.status === 'all' && res === '全选') || filters.status === res 
                                ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600'
                            }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">按部门</p>
                    <Select value={filters.department} onValueChange={(val) => setFilters({...filters, department: val})}>
                      <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="全部部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部部门</SelectItem>
                        <SelectItem value="前端部">前端部</SelectItem>
                        <SelectItem value="UI部">UI部</SelectItem>
                        <SelectItem value="办公室">办公室</SelectItem>
                        <SelectItem value="运维">运维</SelectItem>
                        <SelectItem value="后端部">后端部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">按投递时间</p>
                    <Select value={filters.time} onValueChange={(val) => setFilters({...filters, time: val})}>
                      <SelectTrigger className="w-full h-10 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="全部时间" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部时间</SelectItem>
                        <SelectItem value="3days">近3天</SelectItem>
                        <SelectItem value="week">近一周</SelectItem>
                        <SelectItem value="month">近一月</SelectItem>
                        <SelectItem value="custom">自定义时间段</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {filters.time === 'custom' && (
                        <div className={cn("grid gap-2")}>
                        <Popover>
                            <PopoverTrigger asChild>
                            <button
                                id="date"
                                className={cn(
                                "w-full justify-start text-left font-normal h-10 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center px-3 gap-2",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y", { locale: zhCN })} -{" "}
                                    {format(dateRange.to, "LLL dd, y", { locale: zhCN })}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y", { locale: zhCN })
                                )
                                ) : (
                                <span>选择日期范围</span>
                                )}
                            </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={zhCN}
                            />
                            </PopoverContent>
                        </Popover>
                        </div>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                        选择收件人 ({selectedCandidateIds.size} / {filteredCandidates.length})
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={selectAllCandidates}
                          className="text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                        >
                          全选
                        </button>
                        <button 
                          onClick={clearSelections}
                          className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {filteredCandidates.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => toggleCandidate(c.id)}
                              className={`flex items-center justify-between text-[10px] cursor-pointer border-b border-blue-100 dark:border-blue-900/20 last:border-0 py-1.5 px-1 rounded transition-colors ${
                                selectedCandidateIds.has(c.id) 
                                  ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' 
                                  : 'text-blue-600/70 dark:text-blue-400/70 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                              }`}
                            >
                                <div className="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedCandidateIds.has(c.id)}
                                      onChange={() => {}}
                                      className="w-3 h-3 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="font-medium">{c.name}</span>
                                </div>
                                <span>{c.email || '无邮箱'}</span>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
          )
        )}

        {activeTab === 'templates' && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all group shadow-sm relative">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded">
                    {template.category}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditDialog(template)}
                      className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteTemplate(template.id, e)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-black mb-4 tracking-tight">{template.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-3 mb-8 font-medium leading-relaxed">{template.content}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Updated: 2024-02-01</span>
                </div>
              </div>
            ))}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  onClick={openCreateDialog}
                  className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">New Template</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {isEditing ? '编辑邮件模板' : '新建邮件模板'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">模板名称</label>
                      <input 
                        type="text" 
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                        placeholder="例如：面试通过通知"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分类</label>
                      <Select 
                        value={currentTemplate.category} 
                        onValueChange={(val) => setCurrentTemplate({...currentTemplate, category: val})}
                      >
                        <SelectTrigger className="w-full h-[46px] bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="面试">面试</SelectItem>
                          <SelectItem value="通过">通过</SelectItem>
                          <SelectItem value="拒信">拒信</SelectItem>
                          <SelectItem value="通用">通用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">邮件主题</label>
                    <input 
                      type="text" 
                      value={currentTemplate.subject}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                      placeholder="输入邮件主题..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">模板内容</label>
                      <div className="flex gap-2">
                        {['姓名', '时间', '部门', '链接'].map(v => (
                          <button 
                            key={v} 
                            onClick={() => setCurrentTemplate(prev => ({...prev, content: (prev.content || '') + `{{${v}}}`}))}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] rounded font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            + {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      rows={8}
                      value={currentTemplate.content}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                      placeholder="输入模板内容，支持使用上方变量..."
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
                <DialogFooter>
                  <button 
                    onClick={() => setIsDialogOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSaveTemplate}
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                  >
                    {isEditing ? '保存修改' : '立即创建'}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">模板/任务</th>
                  <th className="px-6 py-4">主题</th>
                  <th className="px-6 py-4">发送状态</th>
                  <th className="px-6 py-4">时间</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-bold">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5 text-sm font-black">{item.templateName}</td>
                      <td className="px-6 py-5 text-xs text-slate-500">{item.subject}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {item.status === 'success' ? 'SUCCESS' : 'FAILED'}
                          </div>
                          <span className="text-[10px] font-black text-slate-400">
                            {item.recipientCount} Recipients
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[10px] text-slate-400 uppercase font-black">{item.sentAt}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleViewDetail(item.id)}
                               disabled={isDetailLoading}
                               className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-slate-300 hover:text-blue-500 transition-colors disabled:opacity-50"
                               title="查看详情"
                             >
                               <Eye className="w-4 h-4" />
                             </button>
                             <button 
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-300 hover:text-rose-500 transition-colors"
                              title="删除记录"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                      暂无发送记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Dialog open={!!viewingHistoryItem} onOpenChange={(open) => !open && setViewingHistoryItem(null)}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                            <Mail className="w-5 h-5 text-blue-600" />
                            发送详情
                        </DialogTitle>
                    </DialogHeader>
                    
                    {viewingHistoryItem && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">邮件主题</label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold">
                                    {viewingHistoryItem.subject}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">邮件内容</label>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {viewingHistoryItem.content || '（无内容快照）'}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">收件人列表 ({viewingHistoryItem.recipients?.length || 0})</label>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold">
                                            成功: {viewingHistoryItem.recipients?.filter((r: any) => r.status === 'sent' || r.status === 'success').length || 0}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded font-bold">
                                            失败: {viewingHistoryItem.recipients?.filter((r: any) => r.status === 'failed').length || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <th className="px-4 py-2">姓名</th>
                                                    <th className="px-4 py-2">邮箱</th>
                                                    <th className="px-4 py-2 text-right">状态</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {viewingHistoryItem.recipients?.map((r: any, idx: number) => (
                                                    <tr key={idx} className="text-xs">
                                                        <td className="px-4 py-2 font-bold">{r.name}</td>
                                                        <td className="px-4 py-2 text-slate-500">{r.email || '-'}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                r.status === 'failed' 
                                                                    ? 'bg-rose-50 text-rose-600' 
                                                                    : 'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                                {r.status === 'failed' ? 'Failed' : 'Sent'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
