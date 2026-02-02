import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, 
  Clock, 
  MapPin, 
  FileSearch, 
  BrainCircuit, 
  MessageSquare, 
  AtSign, 
  FileText 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { InterviewTask, Stage } from '@/types';

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
            <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
                <h3 className="text-lg font-black tracking-tight uppercase">面试详情 & 简历</h3>
              </div>
              <div className="flex items-center gap-2">
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

            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {/* Student Header */}
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{task.name}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mt-2">
                      {task.department} • {task.major} • 学号: {task.studentId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                    <div className="text-4xl font-black text-blue-600">{task.aiScore}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mb-1">面试时间</p>
                    <div className="flex items-center gap-2 font-black text-sm text-blue-900 dark:text-blue-300">
                      <Clock className="w-4 h-4" />
                      {task.time}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">地点/方式</p>
                    <div className="flex items-center gap-2 font-black text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {task.location}
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
  );
}
