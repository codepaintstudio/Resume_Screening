import React from 'react';
import { 
  XCircle, Download, FileSearch, BrainCircuit, 
  Briefcase, MessageSquare, Send, AtSign 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Student } from '@/types';
import { STATUS_MAP } from '@/config/constants';

interface CandidateDrawerProps {
  student: Student | null;
  onClose: () => void;
  onStatusChange: (studentId: string | number, newStatus: keyof typeof STATUS_MAP) => void;
}

export function CandidateDrawer({ student, onClose, onStatusChange }: CandidateDrawerProps) {
  return (
    <AnimatePresence>
      {student && (
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
                <h3 className="text-lg font-black tracking-tight">候选人档案</h3>
              </div>
              <div className="flex items-center gap-2">
                {student.status === 'pending' && (
                  <button 
                    onClick={() => onStatusChange(student.id, 'interviewing')}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all"
                  >
                    安排面试
                  </button>
                )}
                {student.status === 'interviewing' && (
                  <>
                    <button 
                      onClick={() => onStatusChange(student.id, 'passed')}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all"
                    >
                      通过面试
                    </button>
                    <button 
                      onClick={() => onStatusChange(student.id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                    >
                      淘汰
                    </button>
                  </>
                )}
                
                {/* Status Override / Correction */}
                <div className="relative">
                    <Select 
                      value={student.status}
                      onValueChange={(val: keyof typeof STATUS_MAP) => onStatusChange(student.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-9 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="interviewing">面试中</SelectItem>
                        <SelectItem value="passed">已通过</SelectItem>
                        <SelectItem value="rejected">已淘汰</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{student.name}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mt-2">
                      {student.department} • {student.major} • {student.class}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-5">
                      {(() => {
                        const studentTags = Array.isArray(student.tags) 
                          ? student.tags 
                          : [student.tags].filter(Boolean);
                        
                        return studentTags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700">
                            {tag}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                    <div className="text-5xl font-black text-blue-600">{student.aiScore}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    { label: '学号', value: student.studentId },
                    { label: 'GPA', value: student.gpa, color: 'text-emerald-600' },
                    { label: '状态', value: STATUS_MAP[student.status].label },
                    { label: '最后更新', value: '刚刚' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-700 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.label}</p>
                      <p className={`mt-1 font-black ${item.color || 'text-slate-900 dark:text-white'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Actions for original file & AI details */}
                <div className="flex gap-4 mb-10">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-black/10">
                    <FileSearch className="w-4 h-4" />
                    查看原简历 PDF
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50">
                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                    AI 深度评估
                  </button>
                </div>

                <section className="space-y-6">
                  <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    经历概述
                  </h4>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-sm"></div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">2023.09 - 2024.01</p>
                      <p className="font-black text-sm mt-1">实验室官网开发项目</p>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">独立使用 Next.js 完成了官网的前端构建，集成了暗色模式与响应式设计。</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Discussion Area */}
            <div className="h-80 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Discussion</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">M</div>
                  <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase">Admin</span>
                      <span className="text-[9px] text-slate-300">刚刚</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      该候选人的 GitHub 提交记录非常活跃，建议面试时重点考察项目实践。
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                  <AtSign className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="回复评论..." className="flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 font-medium" />
                  <button className="p-1.5 bg-blue-600 text-white rounded-lg"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
