import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, MapPin, User, MoreHorizontal, ArrowRight } from 'lucide-react';
import { InterviewTask, Stage } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { STATUS_MAP } from '@/config/constants';

interface KanbanCardProps {
  task: InterviewTask;
  index: number;
  onClick?: (task: InterviewTask) => void;
  onMoveTask?: (taskId: string, newStage: Stage) => void;
}

// 样式常量
const CARD_STYLES = {
  base: 'relative w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer outline-none group',
  transition: 'transition-all duration-200 ease-out',
  idle: 'shadow-sm hover:shadow-md hover:border-blue-400 hover:dark:border-blue-600',
  dragging: 'shadow-2xl ring-2 ring-blue-500/30 opacity-95',
} as const;

const SCORE_BADGE = {
  high: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  default: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
} as const;

export function KanbanCard({ task, index, onClick, onMoveTask }: KanbanCardProps) {
  // 定义可流转的目标状态
  const availableMoves: Stage[] = ['pending_interview', 'interviewing', 'passed', 'rejected'].filter(
    s => s !== task.stage
  ) as Stage[];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const isDragging = snapshot.isDragging;
        
        // 合并样式 - 避免重复计算
        const cardClassName = `
          ${CARD_STYLES.base}
          ${CARD_STYLES.transition}
          ${isDragging ? CARD_STYLES.dragging : CARD_STYLES.idle}
        `.trim();

        const scoreClassName = `
          px-2 py-0.5 rounded text-[9px] font-black uppercase transition-colors duration-200
          ${task.aiScore >= 90 ? SCORE_BADGE.high : SCORE_BADGE.default}
        `.trim();

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-3"
            style={{
              ...provided.draggableProps.style,
              // 优化拖拽动画 - 使用 GPU 加速
              transition: isDragging 
                ? provided.draggableProps.style?.transition 
                : undefined,
            }}
          >
            <div
              onClick={() => onClick?.(task)}
              className={cardClassName}
            >
              {/* 快捷操作菜单 - 仅在移动端或Hover时显示，防止误触 */}
              <div className="absolute top-3 right-3 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 z-[9999]">
                      <DropdownMenuLabel className="text-xs text-slate-400">移动至...</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableMoves.map(stage => (
                        <DropdownMenuItem 
                          key={stage}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveTask?.(task.id, stage);
                          }}
                          className="flex items-center justify-between text-xs font-bold"
                        >
                           <span className={STATUS_MAP[stage]?.color ? `px-1.5 py-0.5 rounded ${STATUS_MAP[stage].color}` : ''}>
                              {STATUS_MAP[stage]?.label || stage}
                           </span>
                           <ArrowRight className="w-3 h-3 text-slate-300" />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              {/* 头部 - 名字和AI分数 */}
              <div className="flex justify-between items-start mb-3 gap-2 pr-8">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate">{task.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">
                    {task.department} • {task.major}
                  </p>
                </div>
                <div className={scoreClassName}>
                  AI: {task.aiScore}
                </div>
              </div>

              {/* 信息卡片 - 时间和地点 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                  <Clock 
                    className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <span>{task.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                  <MapPin 
                    className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <span className="truncate">{task.location}</span>
                </div>
              </div>

              {/* 底部 - 面试官 */}
              <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <User 
                    className="w-3 h-3 text-slate-400 flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <span className="text-[10px] text-slate-400 font-bold truncate">
                    面试官: {task.interviewers?.join(', ') || task.interviewer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}