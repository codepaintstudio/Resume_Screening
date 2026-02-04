import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search,
  MousePointer,
  Users,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Stage, InterviewTask } from '@/types';
import { KanbanColumn } from './kanban/KanbanColumn';
import { CandidateDrawer } from './resume/CandidateDrawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { zhCN } from 'date-fns/locale';
import { format } from "date-fns";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

const initialTasks: InterviewTask[] = [
  { id: '1', name: '王晓燕', major: '数字媒体艺术', department: 'UI部', time: '14:00 今天', interviewer: '张静', location: '飞书会议', priority: 'high', stage: 'interviewing', studentId: '2021001', gpa: '3.8', aiScore: 92, tags: ['Figma', '插画'] },
  { id: '2', name: '刘洋', major: '软件工程', department: '前端部', time: '10:00 明天', interviewer: '李雷', location: '工作室A区', priority: 'medium', stage: 'pending', studentId: '2021045', gpa: '3.7', aiScore: 85, tags: ['React', 'Node'] },
  { id: '3', name: '周博', major: '人工智能', department: '运维', time: '15:30 2月5日', interviewer: '王武', location: '电话面试', priority: 'low', stage: 'passed', studentId: '2022012', gpa: '3.9', aiScore: 88, tags: ['Linux', 'Python'] },
  { id: '4', name: '李华', major: '计算机科学', department: '前端部', time: '未安排', interviewer: '待定', location: '待定', priority: 'medium', stage: 'pending', studentId: '2021046', gpa: '3.6', aiScore: 82, tags: ['Vue', 'TS'] },
  { id: '5', name: '张三', major: '软件工程', department: '后端部', time: '未安排', interviewer: '待定', location: '待定', priority: 'high', stage: 'pending', studentId: '2021047', gpa: '3.9', aiScore: 90, tags: ['Java', 'Spring'] },
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTip, setShowScrollTip] = useState(false);
  
  // Batch Schedule State
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedBatchCandidates, setSelectedBatchCandidates] = useState<string[]>([]);
  const [batchDate, setBatchDate] = useState<Date>();
  const [batchTime, setBatchTime] = useState('');
  
  const pendingTasks = tasks.filter(t => t.stage === 'pending');

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        // User request: Scroll Down (positive) -> Right (positive scrollLeft change)
        // Scroll Up (negative) -> Left (negative scrollLeft change)
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const hasSeenTip = localStorage.getItem('hasSeenKanbanScrollTip');
    if (!hasSeenTip) {
      setShowScrollTip(true);
      const timer = setTimeout(() => {
        setShowScrollTip(false);
        localStorage.setItem('hasSeenKanbanScrollTip', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const moveTask = (taskId: string, newStage: Stage) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: newStage } : t));
    toast.success('状态已更新');
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get current tasks
    const currentTasks = [...tasks];
    
    // Split tasks by stage to simulate the visual columns
    const sourceStageId = source.droppableId as Stage;
    const destStageId = destination.droppableId as Stage;
    
    // We need to operate on the filtered lists to match visual indices
    const sourceList = currentTasks.filter(t => t.stage === sourceStageId);
    const destList = sourceStageId === destStageId ? sourceList : currentTasks.filter(t => t.stage === destStageId);
    const otherTasks = currentTasks.filter(t => t.stage !== sourceStageId && t.stage !== destStageId);

    // Find the moved task in the source list
    const [movedTask] = sourceList.splice(source.index, 1);
    
    // Update stage
    movedTask.stage = destStageId;
    
    // Insert into destination list
    destList.splice(destination.index, 0, movedTask);
    
    // Reconstruct the full task list
    // Note: The order of concatenation matters for the next render's "index" stability if we rely on array order.
    // Here we just put them back together.
    let newTasks: InterviewTask[] = [];
    
    // To preserve the order of stages in the main array (somewhat), we can iterate stages
    // But simply concatenating is easier and works since we filter by stage for rendering.
    if (sourceStageId === destStageId) {
      newTasks = [...otherTasks, ...sourceList]; // sourceList is now the modified list (same as destList)
    } else {
      newTasks = [...otherTasks, ...sourceList, ...destList];
    }
    
    setTasks(newTasks);
    toast.success('状态已更新');
  };

  const handleUpdateTaskStage = (task: InterviewTask, newStage: Stage) => {
      setSelectedTask(prev => prev ? { ...prev, stage: newStage } : null);
  }

  const handleBatchSchedule = () => {
    if (selectedBatchCandidates.length === 0) {
      toast.error('请至少选择一位候选人');
      return;
    }
    if (!batchDate || !batchTime) {
      toast.error('请设置面试时间');
      return;
    }

    const formattedDate = format(batchDate, 'M月d日', { locale: zhCN });
    const newTime = `${batchTime} ${formattedDate}`;

    setTasks(prev => prev.map(t => {
      if (selectedBatchCandidates.includes(t.id)) {
        return { ...t, time: newTime, stage: 'interviewing' as Stage };
      }
      return t;
    }));

    toast.success(`已为 ${selectedBatchCandidates.length} 位候选人安排面试`);
    setIsBatchDialogOpen(false);
    setSelectedBatchCandidates([]);
    setBatchDate(undefined);
    setBatchTime('');
  };

  const toggleBatchCandidate = (id: string) => {
    setSelectedBatchCandidates(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAllBatchCandidates = () => {
    if (selectedBatchCandidates.length === pendingTasks.length) {
      setSelectedBatchCandidates([]);
    } else {
      setSelectedBatchCandidates(pendingTasks.map(t => t.id));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
        
        <button 
          onClick={() => setIsBatchDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          新增面试安排
        </button>

        <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
          <DialogContent className="sm:max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>批量安排面试</DialogTitle>
            </DialogHeader>
            <div className="flex gap-6 py-4">
              {/* Left: Candidate List */}
              <div className="w-1/2 border-r border-slate-100 dark:border-slate-800 pr-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">待安排候选人 ({pendingTasks.length})</h4>
                  <button 
                    onClick={selectAllBatchCandidates}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {selectedBatchCandidates.length === pendingTasks.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">暂无待安排候选人</div>
                  ) : (
                    pendingTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => toggleBatchCandidate(task.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedBatchCandidates.includes(task.id)
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              selectedBatchCandidates.includes(task.id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {selectedBatchCandidates.includes(task.id) && <Plus className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{task.name}</p>
                              <p className="text-xs text-slate-500">{task.department} • {task.major}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-400">{task.studentId}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Date & Time */}
              <div className="w-1/2 pl-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">设置时间</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={batchDate}
                      onSelect={setBatchDate}
                      className="rounded-md border bg-white dark:bg-slate-950 shadow-sm"
                      locale={zhCN}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input 
                      type="time" 
                      value={batchTime}
                      onChange={(e) => setBatchTime(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={handleBatchSchedule}
                      disabled={selectedBatchCandidates.length === 0 || !batchDate || !batchTime}
                      className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
                    >
                      确认安排 ({selectedBatchCandidates.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showScrollTip && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium backdrop-blur-sm border border-white/10">
            <span className="bg-white/20 p-1 rounded-full">
              <MousePointer className="w-3 h-3" />
            </span>
            使用鼠标滚轮下滑向右，上滑向左
          </div>
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto pb-4 no-scrollbar"
      >
        <div className="flex gap-6 h-full min-w-full lg:min-w-0">
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
      
      <div className="flex items-center justify-center gap-2 pb-2 text-slate-400">
        <MousePointer className="w-3 h-3" />
        <span className="text-[10px] font-medium uppercase tracking-widest">
          Tips: 鼠标滚轮下滑向右，上滑向左
        </span>
      </div>

      <CandidateDrawer 
        student={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={(id, newStatus) => {
            // Adapt the status change for InterviewTask
            moveTask(id as string, newStatus);
            handleUpdateTaskStage(selectedTask!, newStatus);
        }}
        onUpdate={(updatedData) => {
            // Update the selected task locally
            setSelectedTask(prev => prev ? { ...prev, ...updatedData } : null);
            // Update the task in the list
            setTasks(prev => prev.map(t => t.id === updatedData.id ? { ...t, ...updatedData } : t));
        }}
        type="interview"
      />
    </div>
    </DragDropContext>
  );
}
