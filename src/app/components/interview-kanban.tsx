import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  XCircle,
  Download,
  Eye,
  BrainCircuit,
  MessageSquare,
  Send,
  AtSign,
  FileSearch,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type Stage = 'pending' | 'interviewing' | 'passed' | 'rejected';

interface InterviewTask {
  id: string;
  name: string;
  major: string;
  department: string;
  time: string;
  interviewer: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  stage: Stage;
  studentId: string;
  gpa: string;
  aiScore: number;
  tags: string[];
}

const initialTasks: InterviewTask[] = [
  { id: '1', name: '王晓燕', major: '数字媒体艺术', department: 'UI部', time: '14:00 今天', interviewer: '张静', location: '飞书会议', priority: 'high', stage: 'interviewing', studentId: '2021001', gpa: '3.8', aiScore: 92, tags: ['Figma', '插画'] },
  { id: '2', name: '刘洋', major: '软件工程', department: '前端部', time: '10:00 明天', interviewer: '李雷', location: '工作室A区', priority: 'medium', stage: 'pending', studentId: '2021045', gpa: '3.7', aiScore: 85, tags: ['React', 'Node'] },
  { id: '3', name: '周博', major: '人工智能', department: '运维', time: '15:30 2月5日', interviewer: '王武', location: '电话面试', priority: 'low', stage: 'passed', studentId: '2022012', gpa: '3.9', aiScore: 88, tags: ['Linux', 'Python'] },
];

const stages: { id: Stage, label: string, color: string }[] = [
  { id: 'pending', label: '待面试', color: 'bg-slate-500' },
  { id: 'interviewing', label: '面试中', color: 'bg-blue-500' },
  { id: 'passed', label: '面试通过', color: 'bg-emerald-500' },
  { id: 'rejected', label: '未通过', color: 'bg-rose-500' },
];

export function InterviewKanban() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<InterviewTask | null>(null);

  const moveTask = (taskId: string, newStage: Stage) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: newStage } : t));
    toast.success('状态已更新');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索候选人..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" />
          新增面试安排
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {stages.map((stage) => (
            <div key={stage.id} className="w-80 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{stage.label}</h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                    {tasks.filter(t => t.stage === stage.id).length}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {tasks.filter(t => t.stage === stage.id).map((task) => (
                  <motion.div
                    layoutId={task.id}
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-black">{task.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{task.department} • {task.major}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          task.aiScore >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          AI: {task.aiScore}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{task.location}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-bold">面试官: {task.interviewer}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume/Interview Detail Overlay */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <XCircle className="w-5 h-5 text-slate-400" />
                  </button>
                  <h3 className="text-lg font-black tracking-tight uppercase">面试详情 & 简历</h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTask.stage === 'pending' && (
                    <button 
                      onClick={() => { moveTask(selectedTask.id, 'interviewing'); setSelectedTask(prev => prev ? { ...prev, stage: 'interviewing' } : null); }}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all"
                    >
                      安排面试
                    </button>
                  )}
                  {selectedTask.stage === 'interviewing' && (
                    <>
                      <button 
                        onClick={() => { moveTask(selectedTask.id, 'passed'); setSelectedTask(prev => prev ? { ...prev, stage: 'passed' } : null); }}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        通过面试
                      </button>
                      <button 
                        onClick={() => { moveTask(selectedTask.id, 'rejected'); setSelectedTask(prev => prev ? { ...prev, stage: 'rejected' } : null); }}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                      >
                        淘汰
                      </button>
                    </>
                  )}

                  <div className="relative">
                      <select 
                        value={selectedTask.stage}
                        onChange={(e) => { 
                          const newStage = e.target.value as Stage;
                          moveTask(selectedTask.id, newStage);
                          setSelectedTask(prev => prev ? { ...prev, stage: newStage } : null);
                        }}
                        className="appearance-none pl-4 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="pending">待面试</option>
                        <option value="interviewing">面试中</option>
                        <option value="passed">面试通过</option>
                        <option value="rejected">未通过</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {/* Student Header */}
                  <div className="mb-8 flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedTask.name}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mt-2">
                        {selectedTask.department} • {selectedTask.major} • 学号: {selectedTask.studentId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                      <div className="text-4xl font-black text-blue-600">{selectedTask.aiScore}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1">面试时间</p>
                      <div className="flex items-center gap-2 font-black text-sm text-blue-900 dark:text-blue-300">
                        <Clock className="w-4 h-4" />
                        {selectedTask.time}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">地点/方式</p>
                      <div className="flex items-center gap-2 font-black text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {selectedTask.location}
                      </div>
                    </div>
                  </div>

                  {/* Actions for original file & AI details */}
                  <div className="flex gap-3 mb-10">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90">
                      <FileSearch className="w-4 h-4" />
                      查看原简历文件
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50">
                      <BrainCircuit className="w-4 h-4 text-blue-600" />
                      AI 详细评估报告
                    </button>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
