import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Stage, InterviewTask } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  stage: { id: Stage; label: string; color: string };
  tasks: InterviewTask[];
  onTaskClick: (task: InterviewTask) => void;
}

export function KanbanColumn({ stage, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <Droppable droppableId={stage.id}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`w-[85vw] sm:w-96 lg:w-auto lg:flex-1 lg:min-w-[250px] min-h-[450px] flex flex-col rounded-2xl p-4 border flex-shrink-0 lg:flex-shrink transition-colors duration-200 ${
            snapshot.isDraggingOver 
              ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{stage.label}</h3>
              <span className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                {tasks.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pb-2 no-scrollbar">
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onClick={onTaskClick} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
