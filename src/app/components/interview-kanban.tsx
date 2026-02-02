import React, { useState } from 'react';
import { 
  Plus, 
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Stage, InterviewTask } from '@/types';
import { KanbanColumn } from './kanban/KanbanColumn';
import { InterviewDetailDrawer } from './kanban/InterviewDetailDrawer';

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

  const handleUpdateTaskStage = (task: InterviewTask, newStage: Stage) => {
      setSelectedTask(prev => prev ? { ...prev, stage: newStage } : null);
  }

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
            <KanbanColumn 
                key={stage.id} 
                stage={stage} 
                tasks={tasks.filter(t => t.stage === stage.id)}
                onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </div>

      <InterviewDetailDrawer 
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onMoveTask={moveTask}
        onUpdateTaskStage={handleUpdateTaskStage}
      />
    </div>
  );
}
