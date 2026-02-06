import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/app/components/ui/utils";
import { Student, InterviewTask, Experience } from '@/types';
import { STATUS_MAP } from '@/config/constants';
import { 
  XCircle, Download, FileSearch, 
  Briefcase, MessageSquare, Send, AtSign,
  Phone, Mail, Edit2, Save, HelpCircle,
  BrainCircuit, Plus, X, Trash2, Calendar as CalendarIcon, Clock, ChevronDown, Check,
  Maximize2, Minimize2
} from 'lucide-react';
import { toast } from "sonner";
import { useAppStore } from '@/store';

interface CandidateDrawerProps {
  student: Student | InterviewTask | null;
  onClose: () => void;
  onStatusChange: (id: string | number, newStatus: any) => void;
  onUpdate?: (data: Partial<Student | InterviewTask>) => void;
  type?: 'resume' | 'interview';
}

function YearMonthPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - 10 + i); // 10 years back, 4 years forward
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [year, month] = value ? value.split('.').map(Number) : [currentYear, 1];

  const handleYearChange = (y: string) => {
    onChange(`${y}.${month.toString().padStart(2, '0')}`);
  };

  const handleMonthChange = (m: string) => {
    onChange(`${year}.${m.padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-1">
      <Select value={year.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-8 w-[80px] text-xs font-bold bg-white dark:bg-slate-900 border-slate-200">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="z-[1002]">
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-slate-400 font-bold">.</span>
      <Select value={month.toString().padStart(2, '0')} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-8 w-[70px] text-xs font-bold bg-white dark:bg-slate-900 border-slate-200">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent className="z-[1002]">
          {months.map((m) => (
            <SelectItem key={m} value={m.toString().padStart(2, '0')}>{m.toString().padStart(2, '0')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { Skeleton } from "@/app/components/ui/skeleton";

export function CandidateDrawer({ student, onClose, onStatusChange, onUpdate, type = 'resume' }: CandidateDrawerProps) {
  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(undefined);
  const [interviewTime, setInterviewTime] = useState<string>("14:00");
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [availableInterviewers, setAvailableInterviewers] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const wsRef = React.useRef<WebSocket | null>(null);
  const commentsEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isCommentsExpanded]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/interviewers')
      .then(res => res.json())
      .then(data => setAvailableInterviewers(data))
      .catch(err => console.error("Failed to fetch interviewers", err));
  }, []);

  const toggleInterviewer = (name: string) => {
    setSelectedInterviewers(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const currentStatus = formData.status || (student as any)?.stage || (student as any)?.status || 'pending';

  React.useEffect(() => {
    if (student) {
      // First set basic data to show something immediately if desired, 
      // but if we want a full "loading screen" effect, we might skip this or just use it for the header.
      // The user requested a "separate loading screen", so we will show skeleton for the content.
      
      setFormData({
        ...student,
        // Reset these to empty/loading state to ensure we don't show stale data or partial data
        email: '',
        phone: '',
        class: '',
        skills: [],
        experiences: []
      });
      
      setIsLoadingDetails(true);
      setIsLoadingComments(true);

      fetch(`/api/resumes/${student.id}`)
        .then(res => res.json())
        .then(data => {
          setFormData(prev => ({
            ...prev,
            ...data,
            // Preserve status from props if it differs (though usually it should be in sync)
            status: prev.status 
          }));
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error("Failed to fetch candidate details", err);
          setIsLoadingDetails(false);
        });

      // Function to fetch comments
      const fetchComments = () => {
        fetch(`/api/resumes/${student.id}/comments`)
          .then(res => res.json())
          .then(data => {
            setComments(data);
            setIsLoadingComments(false);
          })
          .catch(err => {
            console.error("Failed to fetch comments", err);
            setIsLoadingComments(false);
          });
      };

      // Initial fetch
      fetchComments();
      
      // WebSocket Connection for Real-time Updates
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/ws`;
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        
        ws.onopen = () => {
          // Join the room for this candidate
          ws.send(JSON.stringify({
            type: 'JOIN',
            candidateId: student.id
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_COMMENT' && data.candidateId === student.id) {
              setComments(prev => {
                if (prev.some(c => c.id === data.payload.id)) return prev;
                return [...prev, data.payload];
              });
            }
          } catch (e) {
            console.error("Failed to parse WS message", e);
          }
        };
      } catch (err) {
        console.error("WebSocket connection failed", err);
      }
      
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [student]);

  const addExperience = () => {
    const currentYear = new Date().getFullYear();
    const newExp: Experience = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: `${currentYear}.01`,
      endDate: `${currentYear}.06`,
      title: '',
      description: ''
    };
    
    // Prepend without sorting
    const newExps = [newExp, ...(formData.experiences || [])];
    setFormData({ ...formData, experiences: newExps });
  };

  const removeExperience = (index: number) => {
    const newExps = [...(formData.experiences || [])];
    newExps.splice(index, 1);
    setFormData({ ...formData, experiences: newExps });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExps = [...(formData.experiences || [])];
    newExps[index] = { ...newExps[index], [field]: value };
    
    setFormData({ ...formData, experiences: newExps });
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !student) return;
    
    setIsPostingComment(true);
    try {
      // Map technical role to display role
      const roleMapping: Record<string, string> = {
        'admin': '面试官',
        'member': 'HR',
        'teacher': '教师'
      };
      const displayRole = roleMapping[currentUser?.role] || currentUser?.role || '访客';
      const userPayload = {
        ...currentUser,
        role: displayRole,
        name: currentUser?.name || 'Anonymous'
      };

      // Use WebSocket if available
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'SEND_COMMENT',
          candidateId: student.id,
          content: newComment,
          user: userPayload
        }));
        setNewComment('');
        // No need to manually update state, WS message handler will do it
        // toast.success('评论已发布'); // Optional: wait for confirmation or assume success
      } else {
        // Fallback to HTTP
        const res = await fetch(`/api/resumes/${student.id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: newComment,
            user: userPayload 
          })
        });
        const data = await res.json();
        
        if (data.success) {
          setComments(prev => [...prev, data.data]);
          setNewComment('');
          toast.success('评论已发布');
        } else {
          throw new Error(data.message);
        }
      }
    } catch (err) {
      console.error("Failed to post comment", err);
      toast.error('发布评论失败');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/resumes/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('档案已保存');
        setIsEditing(false);
        if (onUpdate) onUpdate(formData);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPDF = () => {
    if (!student) return;
    window.open(`/api/resumes/${student.id}/pdf`, '_blank');
  };

  const handleDownload = () => {
    if (!student) return;
    const link = document.createElement('a');
    link.href = `/api/resumes/${student.id}/download`;
    link.download = `${student.name}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusUpdate = (id: string | number, newStatus: any) => {
     setFormData((prev: any) => ({ ...prev, status: newStatus }));
     onStatusChange(id, newStatus);
  };

  const handleScheduleInterview = () => {
     if (!interviewDate) return;
     if (selectedInterviewers.length === 0) {
       toast.error("请至少选择一位面试官");
       return;
     }

     const formattedDate = format(interviewDate, "yyyy-MM-dd");
     const formattedDateDisplay = format(interviewDate, "M月d日", { locale: zhCN });
     // Combine date and time
     const dateTime = `${interviewTime} ${formattedDateDisplay}`;
     
     // Update local form data to reflect the change immediately
     // Note: we are NOT changing status to 'interviewing' as per user request
     // It remains 'pending_interview' but with a scheduled time
     
     if (onUpdate && student) {
         onUpdate({ 
           ...student, 
           time: dateTime, 
           date: formattedDate,
           interviewers: selectedInterviewers,
           stage: type === 'interview' ? 'pending' : 'pending_interview'
         });
     }

     // Also trigger status change to ensure it moves to pending_interview state
     if (student) {
        handleStatusUpdate(student.id, 'pending_interview');
     }
     
     toast.success("面试安排已更新");
     // Close popover logic is handled by UI interactions or state reset if needed
     // Here we just notify
  };

  const addSkill = () => {
    const newSkills = [...(formData.skills || []), { name: '', level: 'understanding' }];
    setFormData({ ...formData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = [...(formData.skills || [])];
    newSkills.splice(index, 1);
    setFormData({ ...formData, skills: newSkills });
  };

  const updateSkill = (index: number, field: string, value: string) => {
    const newSkills = [...(formData.skills || [])];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setFormData({ ...formData, skills: newSkills });
  };

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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {student && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[999]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-[1000] overflow-hidden flex flex-col border-l border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
                <h3 className="text-lg font-black tracking-tight">候选人档案</h3>
              </div>
                {/* Status Actions */}
                <div className="flex items-center gap-2">
                  {currentStatus === 'pending' && type !== 'interview' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(student.id, 'to_be_scheduled')}
                        className="px-4 py-2 bg-purple-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all"
                      >
                        简历通过
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(student.id, 'rejected')}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                      >
                        淘汰
                      </button>
                    </>
                  )}
                  
                  {/* To Be Scheduled State - Show Schedule Button */}
                  {currentStatus === 'to_be_scheduled' && (
                     <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button 
                            className="px-4 py-2 bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-all"
                          >
                            安排面试
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 z-[1002]" align="end">
                           <div className="space-y-4">
                            <h4 className="font-bold text-sm">设置面试时间</h4>
                            <Calendar
                              mode="single"
                              selected={interviewDate}
                              onSelect={setInterviewDate}
                              className="rounded-md border"
                              locale={zhCN}
                            />
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <div className="relative flex-1">
                                  <input 
                                    type="time" 
                                    value={interviewTime}
                                    onChange={(e) => setInterviewTime(e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300"
                                  />
                              </div>
                              <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs text-slate-500 uppercase">选择面试官</h4>
                              <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                  {availableInterviewers.map(interviewer => (
                                      <div 
                                          key={interviewer}
                                          onClick={() => toggleInterviewer(interviewer)}
                                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                                              selectedInterviewers.includes(interviewer)
                                                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                                  : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                                          }`}
                                      >
                                          <div className="flex items-center gap-2">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                  selectedInterviewers.includes(interviewer) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                              }`}>
                                                  {interviewer.slice(0, 1)}
                                              </div>
                                              <span className="font-bold text-slate-900 dark:text-white">{interviewer}</span>
                                          </div>
                                          {selectedInterviewers.includes(interviewer) && <Check className="w-3 h-3 text-blue-600" />}
                                      </div>
                                  ))}
                              </div>
                            </div>

                            <button 
                              onClick={handleScheduleInterview}
                              disabled={!interviewDate}
                              className="w-full py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              确认安排
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <button 
                        onClick={() => handleStatusUpdate(student.id, 'rejected')}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                      >
                        淘汰
                      </button>
                     </>
                  )}

                  {/* Scheduled / Waiting for Interview */}
                  {(currentStatus === 'pending_interview' || (currentStatus === 'pending' && type === 'interview')) && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all"
                        >
                          修改安排
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4 z-[1002]" align="end">
                        <div className="space-y-4">
                          <h4 className="font-bold text-sm">修改面试时间</h4>
                          <Calendar
                            mode="single"
                            selected={interviewDate}
                            onSelect={setInterviewDate}
                            className="rounded-md border"
                            locale={zhCN}
                          />
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div className="relative flex-1">
                                <input 
                                  type="time" 
                                  value={interviewTime}
                                  onChange={(e) => setInterviewTime(e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300"
                                />
                            </div>
                            <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-xs text-slate-500 uppercase">选择面试官</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                {availableInterviewers.map(interviewer => (
                                    <div 
                                        key={interviewer}
                                        onClick={() => toggleInterviewer(interviewer)}
                                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all text-xs ${
                                            selectedInterviewers.includes(interviewer)
                                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                                : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                selectedInterviewers.includes(interviewer) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                            }`}>
                                                {interviewer.slice(0, 1)}
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{interviewer}</span>
                                        </div>
                                        {selectedInterviewers.includes(interviewer) && <Check className="w-3 h-3 text-blue-600" />}
                                    </div>
                                ))}
                            </div>
                          </div>

                          <button 
                            onClick={handleScheduleInterview}
                            disabled={!interviewDate}
                            className="w-full py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            确认修改
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  {currentStatus === 'pending' && type === 'interview' && (
                    <button 
                      onClick={() => handleStatusUpdate(student.id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                    >
                      淘汰
                    </button>
                  )}
                  {currentStatus === 'interviewing' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(student.id, 'passed')}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all"
                      >
                        通过面试
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(student.id, 'rejected')}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                      >
                        淘汰
                      </button>
                    </>
                  )}
                  
                  {/* Status Override / Correction */}
                  <div className="relative">
                      <Select 
                        value={currentStatus}
                        onValueChange={(val: keyof typeof STATUS_MAP) => handleStatusUpdate(student.id, val)}
                      >
                        <SelectTrigger className="w-[140px] h-9 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[1002]">
                          <SelectItem value="pending">待处理</SelectItem>
                          <SelectItem value="to_be_scheduled">待安排</SelectItem>
                          <SelectItem value="pending_interview">待面试</SelectItem>
                          <SelectItem value="interviewing">面试中</SelectItem>
                          <SelectItem value="passed">已通过</SelectItem>
                          <SelectItem value="rejected">已淘汰</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>

                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {isLoadingDetails ? (
                  <div className="space-y-8 animate-pulse">
                     <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-48" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20 ml-auto" />
                            <Skeleton className="h-12 w-20 ml-auto" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <Skeleton className="h-24 rounded-2xl" />
                         <Skeleton className="h-24 rounded-2xl" />
                     </div>
                     <div className="flex gap-4">
                         <Skeleton className="h-12 flex-1 rounded-2xl" />
                         <Skeleton className="h-12 flex-1 rounded-2xl" />
                     </div>
                     <div className="space-y-4">
                         <Skeleton className="h-4 w-24" />
                         <div className="flex flex-wrap gap-2">
                             <Skeleton className="h-8 w-20 rounded-full" />
                             <Skeleton className="h-8 w-24 rounded-full" />
                             <Skeleton className="h-8 w-16 rounded-full" />
                         </div>
                     </div>
                     <div className="space-y-6">
                         <Skeleton className="h-4 w-32" />
                         <div className="pl-4 border-l-2 border-slate-100 space-y-8">
                             <div className="space-y-2">
                                 <Skeleton className="h-3 w-24" />
                                 <Skeleton className="h-5 w-48" />
                                 <Skeleton className="h-16 w-full" />
                             </div>
                             <div className="space-y-2">
                                 <Skeleton className="h-3 w-24" />
                                 <Skeleton className="h-5 w-48" />
                                 <Skeleton className="h-16 w-full" />
                             </div>
                         </div>
                     </div>
                  </div>
                ) : (
                  <>
                <div className="flex justify-between items-start mb-10">
                  <div className="flex-1 mr-8">
                    <h2 className="text-4xl font-black tracking-tight mb-3">{student.name}</h2>
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
                    {/* Tags section removed as per user request */}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 评估得分</div>
                    <div className="text-5xl font-black text-blue-600">{student.aiScore}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
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
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-50 dark:border-slate-700 shadow-sm">
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
                <div className="flex gap-4 mb-10">
                  <button 
                    onClick={handleViewPDF}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-black/10"
                  >
                    <FileSearch className="w-4 h-4" />
                    查看原简历 PDF
                  </button>
                  <button 
                    onClick={() => {
                      if (isEditing) {
                        handleSaveProfile();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={isSaving}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 border-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      isEditing 
                        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving ? '保存中...' : '保存档案'}
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
                        <TooltipContent className="z-[1002]">
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
                    
                    {isEditing && (
                      <button 
                        onClick={addSkill}
                        className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        添加技能
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill: any, index: number) => (
                      isEditing ? (
                        <div key={index} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <Input 
                            value={skill.name} 
                            onChange={(e) => updateSkill(index, 'name', e.target.value)}
                            className="h-6 w-24 text-xs border-transparent bg-transparent focus-visible:ring-0 px-1"
                            placeholder="技能名称"
                          />
                          <Select 
                            value={skill.level} 
                            onValueChange={(val) => updateSkill(index, 'level', val)}
                          >
                            <SelectTrigger className="h-6 w-[80px] text-[10px] border-none bg-transparent focus:ring-0 px-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[1002]">
                              <SelectItem value="understanding">了解</SelectItem>
                              <SelectItem value="familiar">熟悉</SelectItem>
                              <SelectItem value="proficient">掌握</SelectItem>
                              <SelectItem value="skilled">熟练</SelectItem>
                              <SelectItem value="master">精通</SelectItem>
                            </SelectContent>
                          </Select>
                          <button 
                            onClick={() => removeSkill(index)}
                            className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`px-3 py-1.5 border ${getSkillColor(skill.level)} font-bold text-xs`}
                        >
                          {skill.name}
                        </Badge>
                      )
                    ))}
                    {!formData.skills?.length && !isEditing && (
                      <p className="text-sm text-slate-400 italic">暂无技能记录</p>
                    )}
                  </div>
                </div>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      经历概述
                    </h4>
                    {isEditing && (
                      <button 
                        onClick={addExperience}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        添加经历
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                    {formData.experiences?.length > 0 ? (
                      formData.experiences.map((exp: Experience, index: number) => (
                        isEditing ? (
                          <div key={exp.id} className="relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                            <button 
                              onClick={() => removeExperience(index)}
                              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">开始时间</label>
                                <YearMonthPicker 
                                  value={exp.startDate}
                                  onChange={(val) => updateExperience(index, 'startDate', val)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">结束时间</label>
                                <YearMonthPicker 
                                  value={exp.endDate}
                                  onChange={(val) => updateExperience(index, 'endDate', val)}
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Input 
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                placeholder="项目/经历名称"
                                className="h-8 text-sm font-bold bg-white dark:bg-slate-900"
                              />
                              <textarea 
                                value={exp.description}
                                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                className="w-full min-h-[80px] text-xs font-medium p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 resize-none"
                                placeholder="详细描述..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div key={exp.id} className="relative">
                            <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-sm"></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{exp.startDate} - {exp.endDate}</p>
                            <p className="font-black text-sm mt-1">{exp.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        )
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">暂无经历记录</p>
                    )}
                  </div>
                </section>
                  </>
                )}
              </div>
            </div>

            {/* Discussion Area */}
            <div className={cn(
              "border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col transition-all duration-300 ease-in-out relative z-10",
              isCommentsExpanded ? "h-[60vh] -mt-[20vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]" : "h-80"
            )}>
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer bg-slate-50 dark:bg-slate-900" onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Discussion</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsCommentsExpanded(!isCommentsExpanded); }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  {isCommentsExpanded ? (
                    <Minimize2 className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingComments ? (
                  <div className="space-y-4 animate-pulse">
                     <div className="flex gap-3">
                        <Skeleton className="w-8 h-8 rounded-xl" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-20 w-full rounded-2xl rounded-tl-none" />
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <Skeleton className="w-8 h-8 rounded-xl" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-none" />
                        </div>
                     </div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment: any) => {
                    // Check if the comment belongs to the current user
                    // We compare names because that's what's stored in the comment
                    const isMe = currentUser && (comment.user === currentUser.name || comment.user === 'Me');
                    const isSystem = comment.user === 'System' || comment.role === '系统';
                    
                    return (
                    <div key={comment.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs overflow-hidden shrink-0 ${
                        isSystem ? 'bg-white border border-slate-100 p-1' : 'bg-blue-600'
                      }`}>
                        {isSystem ? (
                          <img src="/logo.png" alt="System" className="w-full h-full object-contain" />
                        ) : (
                          comment.avatar && (comment.avatar.startsWith('http') || comment.avatar.startsWith('/')) && comment.avatar.length > 2 ? (
                            <img src={comment.avatar} alt={comment.user} className="w-full h-full object-cover" />
                          ) : (
                            <span>{comment.user.substring(0, 2).toUpperCase()}</span>
                          )
                        )}
                      </div>
                      <div className={cn(
                        "flex-1 p-4 shadow-sm border border-slate-100 dark:border-slate-700",
                        isMe ? "bg-blue-50 dark:bg-blue-900/20 rounded-2xl rounded-tr-none" : "bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none"
                      )}>
                        <div className={cn("flex items-center mb-1", isMe ? "justify-end" : "justify-between")}>
                          <span className="text-[10px] font-black uppercase">{comment.user} <span className="text-slate-400 font-normal normal-case ml-1">({comment.role})</span></span>
                          {!isMe && <span className="text-[9px] text-slate-300 ml-auto">{comment.time}</span>}
                          {isMe && <span className="text-[9px] text-slate-300 mr-2 order-first">{comment.time}</span>}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  )})
                ) : (
                   <div className="text-center py-8">
                      <p className="text-xs text-slate-400 italic">暂无讨论记录</p>
                   </div>
                )}
                <div ref={commentsEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
                  <AtSign className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="回复评论..." 
                    className="flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 font-medium"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePostComment()}
                    disabled={isPostingComment}
                  />
                  <button 
                    onClick={handlePostComment}
                    disabled={isPostingComment || !newComment.trim()}
                    className="p-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
