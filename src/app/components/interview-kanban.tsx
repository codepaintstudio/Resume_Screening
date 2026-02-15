import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search,
  MousePointer,
  Users,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  X,
  Check,
  RefreshCw
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import { zhCN } from 'date-fns/locale';
import { format } from "date-fns";
import { Skeleton } from "@/app/components/ui/skeleton";
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from '@/store';
import { useSearchParams } from 'next/navigation';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dateFeb5 = new Date(today.getFullYear(), 1, 5);

const formatDate = (d: Date) => format(d, 'yyyy-MM-dd');

const stages: { id: Stage, label: string, color: string }[] = [
  { id: 'pending_interview', label: '待面试', color: 'bg-slate-500' },
  { id: 'interviewing', label: '面试中', color: 'bg-blue-500' },
  { id: 'passed', label: '面试通过', color: 'bg-emerald-500' },
  { id: 'rejected', label: '未通过', color: 'bg-rose-500' },
];

export function InterviewKanban() {
  const { currentUser } = useAppStore();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<InterviewTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<InterviewTask | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTip, setShowScrollTip] = useState(false);
  
  // Batch Schedule State
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedBatchCandidates, setSelectedBatchCandidates] = useState<string[]>([]);
  const [batchDate, setBatchDate] = useState<Date>();
  const [batchTime, setBatchTime] = useState('');
  const [batchLocation, setBatchLocation] = useState('');
  const [batchInterviewers, setBatchInterviewers] = useState<string[]>([]);
  const [availableInterviewers, setAvailableInterviewers] = useState<string[]>([]);

  // Filter State
  const [filterDate, setFilterDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile View State
  const [mobileTabIndex, setMobileTabIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const prevIndexRef = useRef(mobileTabIndex);

  // 手势相关
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    prevIndexRef.current = mobileTabIndex;
  }, [mobileTabIndex]);

  // Fetch tasks from API
  const fetchTasks = () => {
    setIsLoading(true);
    fetch('/api/interviewers')
      .then(res => res.json())
      .then(data => setAvailableInterviewers(data))
      .catch(err => console.error("Failed to fetch interviewers", err));

<<<<<<< HEAD
    fetch('/api/resumes')
      .then(res => res.json())
      .then(data => {
        const mappedTasks: InterviewTask[] = data.map((student: any) => ({
          ...student,
          time: student.time || '未安排',
          interviewers: student.interviewers || [],
          location: student.location || '待定',
          priority: student.priority || 'medium',
          stage: student.status
        }));
=======
    // 同时获取 students 和 interviews 数据
    Promise.all([
      fetch('/api/resumes').then(res => res.json()),
      fetch('/api/interviews').then(res => res.json())
    ])
      .then(([resumesResult, interviewsResult]) => {
        // 处理分页格式的响应
        const studentsData = Array.isArray(resumesResult) ? resumesResult : (resumesResult.data || []);
        const interviewsData = Array.isArray(interviewsResult) ? interviewsResult : (interviewsResult.data || []);
        
        // 建立 studentId -> interview 映射
        const interviewMap = new Map();
        interviewsData.forEach((interview: any) => {
          interviewMap.set(interview.studentId, interview);
        });
        
        // Map Student to InterviewTask，合并面试数据
        const mappedTasks: InterviewTask[] = studentsData.map((student: any) => {
          const interview = interviewMap.get(student.id);
          return {
            ...student,
            id: String(student.id), // 确保 id 是字符串类型
            // 优先使用 interviews 表中的数据，如果没有则使用默认值
            time: interview?.time || student.time || '未安排',
            interviewers: interview?.interviewers || student.interviewers || [],
            location: interview?.location || student.location || '待定',
            priority: interview?.priority || student.priority || 'medium',
            date: interview?.date || student.date,
            // 使用 interviews 表的 stage，如果没有则使用 students 表的 status
            stage: interview?.stage || student.status
          };
        });
>>>>>>> liyang
        setTasks(mappedTasks);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch interview tasks", err);
        toast.error("加载数据失败");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    if (candidateId && tasks.length > 0) {
      const targetTask = tasks.find(t => String(t.id) === candidateId);
      if (targetTask) {
        setSelectedTask(targetTask);
      }
    }
  }, [searchParams, tasks]);

  const pendingTasks = tasks.filter(t => t.stage === 'to_be_scheduled' || t.stage === 'pending');

  const filteredTasks = tasks.filter(t => {
    const isBoardStage = ['pending_interview', 'interviewing', 'passed', 'rejected'].includes(t.stage);
    if (!isBoardStage) return false;
    if (!filterDate && !searchQuery) return true;
    if (filterDate && t.date !== formatDate(filterDate)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(query) ||
        t.department?.toLowerCase().includes(query) ||
        (t.role || '').toLowerCase().includes(query) ||
        (t.studentId || '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isMobile) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isMobile]);

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

  const moveTask = async (taskId: string, newStage: Stage) => {
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: newStage } : t));
    try {
      const res = await fetch(`/api/resumes/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStage, user: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('状态已更新');
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("更新状态失败");
      setTasks(previousTasks);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (filterDate) {
      toast.error('请清除筛选后再进行拖拽排序');
      return;
    }
    const currentTasks = [...tasks];
    const sourceStageId = source.droppableId as Stage;
    const destStageId = destination.droppableId as Stage;
    const sourceList = currentTasks.filter(t => t.stage === sourceStageId);
    const destList = sourceStageId === destStageId ? sourceList : currentTasks.filter(t => t.stage === destStageId);
    const otherTasks = currentTasks.filter(t => t.stage !== sourceStageId && t.stage !== destStageId);
    const [movedTask] = sourceList.splice(source.index, 1);
    movedTask.stage = destStageId;
    destList.splice(destination.index, 0, movedTask);
    let newTasks: InterviewTask[] = [];
    if (sourceStageId === destStageId) {
      newTasks = [...otherTasks, ...sourceList];
    } else {
      newTasks = [...otherTasks, ...sourceList, ...destList];
    }
    setTasks(newTasks);
    if (sourceStageId !== destStageId) {
      try {
        const res = await fetch(`/api/resumes/${draggableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: destStageId, user: currentUser }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('状态已更新');
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error("Failed to update status on drag", err);
        toast.error("更新状态失败");
        setTasks(currentTasks);
      }
    }
  };

  const handleUpdateTaskStage = (task: InterviewTask, newStage: Stage) => {
    setSelectedTask(prev => prev ? { ...prev, stage: newStage } : null);
  };

  const handleBatchSchedule = () => {
    if (selectedBatchCandidates.length === 0) {
      toast.error('请至少选择一位候选人');
      return;
    }
    if (!batchDate || !batchTime) {
      toast.error('请设置面试时间');
      return;
    }
    if (batchInterviewers.length === 0) {
      toast.error('请至少选择一位面试官');
      return;
    }
    const formattedDate = format(batchDate, 'M月d日', { locale: zhCN });
    const formattedISODate = formatDate(batchDate);
    const newTime = `${batchTime} ${formattedDate}`;
    const promise = fetch('/api/interviews/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateIds: selectedBatchCandidates,
        time: newTime,
        date: formattedISODate,
        interviewers: batchInterviewers,
        location: batchLocation
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setTasks(prev => prev.map(t => {
          if (selectedBatchCandidates.includes(t.id)) {
            return { 
<<<<<<< HEAD
              ...t, 
              time: newTime, 
              date: formattedISODate,
              interviewers: batchInterviewers,
              stage: 'pending_interview' as Stage 
=======
                ...t, 
                time: newTime, 
                date: formattedISODate,
                interviewers: batchInterviewers,
                location: batchLocation || '待定',
                stage: 'pending_interview' as Stage 
>>>>>>> liyang
            };
          }
          return t;
        }));
        setIsBatchDialogOpen(false);
        setSelectedBatchCandidates([]);
        setBatchDate(undefined);
        setBatchTime('');
        setBatchLocation('');
        setBatchInterviewers([]);
        return data.message;
      } else {
        throw new Error(data.message || 'Schedule failed');
      }
    });
    toast.promise(promise, {
      loading: '正在安排面试...',
      success: (msg) => msg || `已为 ${selectedBatchCandidates.length} 位候选人安排面试`,
      error: '安排面试失败',
    });
  };

  const toggleBatchCandidate = (id: string) => {
    setSelectedBatchCandidates(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };
  
  const toggleBatchInterviewer = (name: string) => {
    setBatchInterviewers(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const selectAllBatchCandidates = () => {
    if (selectedBatchCandidates.length === pendingTasks.length) {
      setSelectedBatchCandidates([]);
    } else {
      setSelectedBatchCandidates(pendingTasks.map(t => t.id));
    }
  };

  const handleMobileNext = () => {
    if (mobileTabIndex < stages.length - 1) {
      setMobileTabIndex(prev => prev + 1);
    }
  };

  const handleMobilePrev = () => {
    if (mobileTabIndex > 0) {
      setMobileTabIndex(prev => prev - 1);
    }
  };

  // 触摸手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    // 如果水平滑动距离大于垂直滑动距离，并且超过阈值，阻止默认滚动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      e.preventDefault();
      touchMoved.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchMoved.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && mobileTabIndex > 0) {
        // 右滑，上一页
        handleMobilePrev();
      } else if (deltaX < 0 && mobileTabIndex < stages.length - 1) {
        // 左滑，下一页
        handleMobileNext();
      }
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchMoved.current = false;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-[calc(100dvh-180px)] flex flex-col gap-4 md:gap-6">
        {/* 头部筛选栏（保持不变） */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* ... 你的头部代码完全不变 ... */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索候选人..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "flex-1 md:w-[240px] justify-start text-left font-normal rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900",
                      !filterDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP", { locale: zhCN }) : <span>按日期筛选</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
              {filterDate && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFilterDate(undefined)}
                    className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                  >
                      <X className="w-4 h-4 text-slate-500" />
                  </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-2">
            <button 
              onClick={fetchTasks}
              className="flex items-center justify-center w-[38px] h-[38px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all text-slate-400"
              title="刷新看板"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setIsBatchDialogOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              新增面试安排
            </button>
          </div>

          {/* 批量安排对话框（保持不变） */}
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90dvh] overflow-y-auto p-0 gap-0">
              {/* ... 对话框内容完全不变 ... */}
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>批量安排面试</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 p-6 pt-2">
                {/* Left: Candidate List */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6 mb-6 lg:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">待安排候选人 ({pendingTasks.length})</h4>
                    <button 
                      onClick={selectAllBatchCandidates}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {selectedBatchCandidates.length === pendingTasks.length ? '取消全选' : '全选'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

                {/* Middle: Date & Time */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-6 lg:pb-0 lg:px-6 mb-6 lg:mb-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">设置时间</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={batchDate}
                        onSelect={setBatchDate}
                        className="rounded-md border bg-white dark:bg-slate-950 shadow-sm w-full flex justify-center"
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
                  </div>
                </div>
                
                {/* Right: Interviewers */}
                <div className="w-full lg:w-1/3 lg:pl-2 flex flex-col h-[400px] lg:h-auto">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">选择面试官</h4>
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                      {availableInterviewers.map(interviewer => (
                          <div 
                              key={interviewer}
                              onClick={() => toggleBatchInterviewer(interviewer)}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                  batchInterviewers.includes(interviewer)
                                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                      : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                              }`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      batchInterviewers.includes(interviewer) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                  }`}>
                                      {interviewer.slice(0, 1)}
                                  </div>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{interviewer}</span>
                              </div>
                              {batchInterviewers.includes(interviewer) && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                      ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto sticky bottom-0 bg-white dark:bg-slate-950">
                      <button 
                        onClick={handleBatchSchedule}
                        disabled={selectedBatchCandidates.length === 0 || !batchDate || !batchTime || batchInterviewers.length === 0}
                        className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
                      >
                        确认安排 ({selectedBatchCandidates.length})
                      </button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {showScrollTip && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-none hidden md:block">
            <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium backdrop-blur-sm border border-white/10">
              <span className="bg-white/20 p-1 rounded-full">
                <MousePointer className="w-3 h-3" />
              </span>
              使用鼠标滚轮下滑向右，上滑向左
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {/* Desktop View */}
          {!isMobile && (
            <div 
              ref={scrollContainerRef}
              className="hidden md:flex gap-6 h-full min-w-full lg:min-w-0 overflow-x-auto no-scrollbar scroll-smooth"
              style={{ overscrollBehavior: 'contain' }}
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-80 h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-6 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                       <Skeleton className="h-32 w-full rounded-xl" />
                       <Skeleton className="h-32 w-full rounded-xl" />
                       <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                  </div>
                ))
              ) : (
                stages.map((stage) => (
                  <KanbanColumn 
                      key={stage.id} 
                      stage={stage} 
                      tasks={filteredTasks.filter(t => t.stage === stage.id)}
                      onTaskClick={setSelectedTask}
                      onMoveTask={moveTask}
                  />
                ))
              )}
            </div>
          )}

          {/* Mobile View: 手势翻页 + 当前区域标签 */}
          {isMobile && (
            <div 
              className="md:hidden h-full flex flex-col"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex-1 overflow-hidden px-1 relative">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-6 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-32 w-full rounded-xl" />
                      <Skeleton className="h-32 w-full rounded-xl" />
                      <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <AnimatePresence initial={false} mode="wait">
                      <motion.div
                        key={mobileTabIndex}
                        initial={{ 
                          x: (() => {
                            const prev = prevIndexRef.current;
                            const curr = mobileTabIndex;
                            if (curr > prev) return '30%';   // 下一页，从右进
                            if (curr < prev) return '-30%';  // 上一页，从左进
                            return 0;
                          })(),
                          opacity: 0.8
                        }}
                        animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: {
                            type: "tween",
                            duration: 0.18,
                            ease: "easeOut"
                          }
                        }}
                        exit={{ 
                          x: (() => {
                            // 使用 custom 参数获取当前组件的旧索引
                            // 由于在 exit 中无法直接访问 prevIndexRef，通过 custom 传递
                            // 但这里我们直接用函数接收 custom 参数，framer-motion 支持
                            return (custom: number) => {
                              const oldIndex = custom;
                              const newIndex = mobileTabIndex;
                              if (oldIndex < newIndex) return '-30%';  // 旧页向左出
                              if (oldIndex > newIndex) return '30%';   // 旧页向右出
                              return 0;
                            };
                          })(),
                          opacity: 0,
                          transition: {
                            type: "tween",
                            duration: 0.15,
                            ease: "easeIn"
                          }
                        }}
                        custom={mobileTabIndex} // 传递当前组件的索引给 exit
                        className="w-full h-full"
                      >
                        <KanbanColumn 
                          stage={stages[mobileTabIndex]}
                          tasks={filteredTasks.filter(t => t.stage === stages[mobileTabIndex].id)}
                          onTaskClick={setSelectedTask}
                          onMoveTask={moveTask}
                          className="w-full h-full"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              {/* 移动端分页控件：显示当前阶段标签 + 小圆点 */}
              <div className="flex items-center justify-between px-3 py-2 mt-1">
                <button 
                  onClick={handleMobilePrev}
                  disabled={mobileTabIndex === 0}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-90 transition-transform duration-150"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-300">
                    <path d="M15 18L9 12L15 6" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[64px] text-center">
                    {stages[mobileTabIndex].label}
                  </span>
                  <div className="flex gap-1.5">
                    {stages.map((stage, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMobileTabIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          idx === mobileTabIndex 
                            ? 'w-4 bg-blue-600' 
                            : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                        aria-label={`切换到${stage.label}`}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleMobileNext}
                  disabled={mobileTabIndex === stages.length - 1}
                  className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-90 transition-transform duration-150"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 dark:text-slate-300">
                    <path d="M9 18L15 12L9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center justify-center gap-2 pb-2 text-slate-400">
          <MousePointer className="w-3 h-3" />
          <span className="text-[10px] font-medium uppercase tracking-widest">
            Tips: 鼠标滚轮下滑向右，上滑向左
          </span>
        </div>

<<<<<<< HEAD
        <CandidateDrawer 
          student={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(id, newStatus) => {
              moveTask(id as string, newStatus);
              handleUpdateTaskStage(selectedTask!, newStatus);
          }}
          onUpdate={(updatedData) => {
              setSelectedTask(prev => prev ? { ...prev, ...updatedData } : null);
              setTasks(prev => prev.map(t => t.id === updatedData.id ? { ...t, ...updatedData } : t));
          }}
          type="interview"
        />
=======
        <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
          <DialogContent className="sm:max-w-5xl w-full">
            <DialogHeader>
              <DialogTitle>批量安排面试</DialogTitle>
            </DialogHeader>
            <div className="flex gap-6 py-4">
              {/* Left: Candidate List */}
              <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 pr-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">待安排候选人 ({pendingTasks.length})</h4>
                  <button 
                    onClick={selectAllBatchCandidates}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {selectedBatchCandidates.length === pendingTasks.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

              {/* Middle: Date & Time */}
              <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 px-6">
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
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="输入面试地点"
                      value={batchLocation}
                      onChange={(e) => setBatchLocation(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right: Interviewers */}
              <div className="w-1/3 pl-2 flex flex-col">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">选择面试官</h4>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                    {availableInterviewers.map(interviewer => (
                        <div 
                            key={interviewer}
                            onClick={() => toggleBatchInterviewer(interviewer)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                batchInterviewers.includes(interviewer)
                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    batchInterviewers.includes(interviewer) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                }`}>
                                    {interviewer.slice(0, 1)}
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{interviewer}</span>
                            </div>
                            {batchInterviewers.includes(interviewer) && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                    ))}
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button 
                      onClick={handleBatchSchedule}
                      disabled={selectedBatchCandidates.length === 0 || !batchDate || !batchTime || batchInterviewers.length === 0}
                      className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
                    >
                      确认安排 ({selectedBatchCandidates.length})
                    </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
>>>>>>> liyang
      </div>
    </DragDropContext>
  );
}