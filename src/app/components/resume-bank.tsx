import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  Mail, 
  MessageSquare, 
  Download,
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Paperclip,
  Send,
  AtSign,
  Briefcase,
  FileSearch,
  ArrowUpDown,
  Star,
  Clock,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Student } from '@/types';
import { mockStudents as initialMockStudents } from '@/data/mock';

export function ResumeBank() {
  const [students, setStudents] = useState<Student[]>(initialMockStudents);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterDept, setFilterDept] = useState('全部部门');
  const [sortBy, setSortBy] = useState<'ai' | 'gpa' | 'time'>('ai');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/candidates');
        if (res.ok) {
          const data = await res.json();
          // Merge with mock data or replace
          if (Array.isArray(data) && data.length > 0) {
             setStudents(data);
          }
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const statusMap = {
    pending: { label: '待处理', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    interviewing: { label: '面试中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    passed: { label: '面试通过', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejected: { label: '不合适', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  };

  const handleStatusChange = (taskId: string, newStatus: any) => {
    toast.success(`状态已更新为：${statusMap[newStatus as keyof typeof statusMap].label}`);
    setSelectedStudent(prev => prev ? { ...prev, status: newStatus } : null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索候选人..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-bold"
            />
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'ai', label: 'AI评分', icon: Star },
              { id: 'gpa', label: 'GPA', icon: GraduationCap },
              { id: 'time', label: '时间', icon: Clock }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  sortBy === s.id 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <s.icon className="w-3 h-3" />
                {s.label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider hover:border-blue-500 transition-all">
            <Filter className="w-4 h-4" />
            {filterDept}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 shadow-lg shadow-black/10 transition-all">
            <BrainCircuit className="w-4 h-4" />
            AI 简历批量提取
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all" onClick={() => toast.info('上传功能开发中')}>
            <Upload className="w-4 h-4" />
            上传简历
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">候选人</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AI 评分</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">学号 / 部门</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GPA</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {students.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{student.name}</div>
                      <div className="flex gap-1 mt-1">
                        {student.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-sm">
                      {student.aiScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-bold text-slate-900 dark:text-white">{student.studentId}</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">{student.department}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-slate-600 dark:text-slate-400">
                    {student.gpa}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusMap[student.status].color}`}>
                      {statusMap[student.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-300 hover:text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-300 hover:text-slate-600 shadow-sm border border-slate-100 dark:border-slate-700">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
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
                  <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <XCircle className="w-5 h-5 text-slate-400" />
                  </button>
                  <h3 className="text-lg font-black tracking-tight">候选人档案</h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedStudent.status === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(selectedStudent.id, 'interviewing')}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all"
                    >
                      安排面试
                    </button>
                  )}
                  {selectedStudent.status === 'interviewing' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(selectedStudent.id, 'passed')}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        通过面试
                      </button>
                      <button 
                        onClick={() => handleStatusChange(selectedStudent.id, 'rejected')}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                      >
                        淘汰
                      </button>
                    </>
                  )}
                  
                  {/* Status Override / Correction */}
                  <div className="relative">
                      <select 
                        value={selectedStudent.status}
                        onChange={(e) => handleStatusChange(selectedStudent.id, e.target.value)}
                        className="appearance-none pl-4 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="pending">待处理</option>
                        <option value="interviewing">面试中</option>
                        <option value="passed">已通过</option>
                        <option value="rejected">已淘汰</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>

                  <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><Download className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h2 className="text-4xl font-black tracking-tight">{selectedStudent.name}</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mt-2">
                        {selectedStudent.department} • {selectedStudent.major} • {selectedStudent.class}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-5">
                        {selectedStudent.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                      <div className="text-5xl font-black text-blue-600">{selectedStudent.aiScore}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    {[
                      { label: '学号', value: selectedStudent.studentId },
                      { label: 'GPA', value: selectedStudent.gpa, color: 'text-emerald-600' },
                      { label: '状态', value: statusMap[selectedStudent.status].label },
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
    </div>
  );
}
