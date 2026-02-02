import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, User } from 'lucide-react';
import { InterviewTask } from '@/types';

interface KanbanCardProps {
  task: InterviewTask;
  onClick: (task: InterviewTask) => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  return (
    <motion.div
      layoutId={task.id}
      onClick={() => onClick(task)}
      className="relative hover:z-10 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group cursor-pointer"
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
  );
}
