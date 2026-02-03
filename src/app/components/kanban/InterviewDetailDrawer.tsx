import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, 
  FileSearch, 
  MessageSquare, 
  AtSign, 
  FileText,
  MousePointer2,
  Edit2,
  Save,
  Phone,
  Mail,
  HelpCircle,
  Info
} from 'lucide-react';
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { InterviewTask, Stage } from '@/types';
import { ErrorBoundary } from '../ErrorBoundary';

interface InterviewDetailDrawerProps {
  task: InterviewTask | null;
  onClose: () => void;
  onMoveTask: (taskId: string, newStage: Stage) => void;
  onUpdateTaskStage: (task: InterviewTask, newStage: Stage) => void;
}

export function InterviewDetailDrawer({ 
  task, 
  onClose, 
  onMoveTask,
  onUpdateTaskStage
}: InterviewDetailDrawerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTip, setShowScrollTip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        email: task.email || 'admin@mahui.com',
        phone: task.phone || '13800138000',
        class: task.class || '2103班',
        skills: task.skills || [
          { name: 'React', level: 'master' },
          { name: 'TypeScript', level: 'skilled' },
          { name: 'Node.js', level: 'proficient' },
          { name: 'Python', level: 'familiar' },
          { name: 'Go', level: 'understanding' },
        ]
      });
    }
  }, [task]);

  const getSkillColor = (level: string) => {
    switch(level) {
      case 'understanding': return 'bg-slate-100 text-slate-600 border-slate-200'; // 了解
      case 'familiar': return 'bg-blue-50 text-blue-600 border-blue-200'; // 熟悉
      case 'proficient': return 'bg-emerald-50 text-emerald-600 border-emerald-200'; // 掌握
      case 'skilled': return 'bg-orange-50 text-orange-600 border-orange-200'; // 熟练
      case 'master': return 'bg-rose-50 text-rose-600 border-rose-200'; // 精通
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSkillLabel = (level: string) => {
     switch(level) {
      case 'understanding': return '了解';
      case 'familiar': return '熟悉';
      case 'proficient': return '掌握';
      case 'skilled': return '熟练';
      case 'master': return '精通';
      default: return '未知';
    }
  };

  useEffect(() => {
    if (task) {
      // Use a versioned key to ensure the tip shows up for the user after updates
      const hasSeenTip = localStorage.getItem('hasSeenScrollTip_v2');
      if (!hasSeenTip) {
        setShowScrollTip(true);
        const timer = setTimeout(() => {
          setShowScrollTip(false);
          localStorage.setItem('hasSeenScrollTip_v2', 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [task]);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
                <h3 className="text-lg font-black tracking-tight uppercase">面试详情 & 简历</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                {task.stage === 'pending' && (
                  <button 
                    onClick={() => { 
                      onMoveTask(task.id, 'interviewing'); 
                      onUpdateTaskStage(task, 'interviewing');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all"
                  >
                    安排面试
                  </button>
                )}
                {task.stage === 'interviewing' && (
                  <>
                    <button 
                      onClick={() => { 
                        onMoveTask(task.id, 'passed'); 
                        onUpdateTaskStage(task, 'passed');
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all"
                    >
                      通过面试
                    </button>
                    <button 
                      onClick={() => { 
                        onMoveTask(task.id, 'rejected'); 
                        onUpdateTaskStage(task, 'rejected');
                      }}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                    >
                      淘汰
                    </button>
                  </>
                )}
                </div>

                <div className="relative">
                    <Select 
                      value={task.stage}
                      onValueChange={(val) => { 
                        const newStage = val as Stage;
                        onMoveTask(task.id, newStage);
                        onUpdateTaskStage(task, newStage);
                      }}
                    >
                      <SelectTrigger className="w-[140px] h-9 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待面试</SelectItem>
                        <SelectItem value="interviewing">面试中</SelectItem>
                        <SelectItem value="passed">面试通过</SelectItem>
                        <SelectItem value="rejected">未通过</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
              </div>
            </div>

            <ErrorBoundary>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto no-scrollbar relative"
              onWheel={handleWheel}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence>
                {showScrollTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-5 right-4 z-10 bg-slate-900/80 text-white px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-3 shadow-lg pointer-events-none"
                  >
                    <MousePointer2 className="w-4 h-4 animate-bounce" />
                    <span className="text-xs font-bold">使用鼠标滚轮上下滑动查看更多内容</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 md:p-8">
                {/* Student Header */}
                <div className="mb-8 flex justify-between items-start">
                  <div className="flex-1 mr-8">
                    <h2 className="text-3xl font-black tracking-tight mb-3">{task.name}</h2>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                         <Input 
                           value={formData.department || ''} 
                           onChange={(e) => setFormData({...formData, department: e.target.value})} 
                           placeholder="部门/角色"
                           className="h-8 text-xs font-bold bg-white dark:bg-slate-900"
                         />
                         <Input 
                           value={formData.major || ''} 
                           onChange={(e) => setFormData({...formData, major: e.target.value})} 
                           placeholder="专业"
                           className="h-8 text-xs font-bold bg-white dark:bg-slate-900"
                         />
                         <Input 
                           value={formData.class || ''} 
                           onChange={(e) => setFormData({...formData, class: e.target.value})} 
                           placeholder="班级"
                           className="h-8 text-xs font-bold bg-white dark:bg-slate-900"
                         />
                         <Input 
                           value={formData.studentId || ''} 
                           onChange={(e) => setFormData({...formData, studentId: e.target.value})} 
                           placeholder="学号"
                           className="h-8 text-xs font-bold bg-white dark:bg-slate-900"
                         />
                      </div>
                    ) : (
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs flex flex-wrap gap-2 items-center">
                        <span>{formData.department}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formData.major}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formData.class}</span>
                        <span className="text-slate-300">•</span>
                        <span>学号: {formData.studentId}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                    <div className="text-4xl font-black text-blue-600">{task.aiScore}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1">联系邮箱</p>
                    <div className="flex items-center gap-2 font-black text-sm text-blue-900 dark:text-blue-300">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {isEditing ? (
                        <Input 
                          value={formData.email || ''} 
                          onChange={(e) => setFormData({...formData, email: e.target.value})} 
                          className="h-7 text-xs bg-white/50 border-blue-200" 
                        />
                      ) : (
                        <span className="truncate">{formData.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">联系电话</p>
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {isEditing ? (
                        <Input 
                          value={formData.phone || ''} 
                          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                          className="h-7 text-xs bg-white border-slate-200" 
                        />
                      ) : (
                        <span>{formData.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions for original file & Edit Profile */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90">
                    <FileSearch className="w-4 h-4" />
                    查看原简历文件
                  </button>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      isEditing 
                        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4" />
                        保存档案
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                        编辑档案
                      </>
                    )}
                  </button>
                </div>

                {/* Skills Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">技能清单</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-400 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-2 p-1">
                            <p className="font-bold text-xs mb-2">熟练度说明</p>
                            <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-slate-400"></div>了解 (Understanding)</div>
                            <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-blue-500"></div>熟悉 (Familiar)</div>
                            <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>掌握 (Proficient)</div>
                            <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-orange-500"></div>熟练 (Skilled)</div>
                            <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-rose-500"></div>精通 (Master)</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`px-3 py-1.5 border ${getSkillColor(skill.level)} font-bold text-xs`}
                      >
                        {skill.name}
                        {/* Show level text on hover or always? Prompt says "hover on ? icon shows what colors mean". So colors are enough. */}
                      </Badge>
                    ))}
                    {!formData.skills?.length && (
                      <p className="text-sm text-slate-400 italic">暂无技能记录</p>
                    )}
                  </div>
                </div>

                {/* Comments/Evaluation */}
                <section className="space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    面试官评语 & 讨论
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">M</div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black uppercase">张静 (面试官)</span>
                          <span className="text-[9px] text-slate-400">刚刚</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                          表达能力很强，对 UI 设计有自己的见解，展示的作品集非常完整。建议通过。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                    <textarea 
                      placeholder="输入面试评价或 @ 成员讨论..."
                      className="w-full bg-transparent border-none text-xs outline-none focus:ring-0 font-medium min-h-24 resize-none"
                    />
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex gap-2">
                        <AtSign className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" />
                        <FileText className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" />
                      </div>
                      <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        提交评语
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            </ErrorBoundary>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
