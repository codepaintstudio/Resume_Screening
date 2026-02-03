import React from 'react';
import { Search, Filter, ArrowUpDown, BrainCircuit, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { DEPARTMENTS, SORT_OPTIONS, SortOptionId } from '@/config/constants';

interface FilterToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: SortOptionId;
  setSortBy: (value: SortOptionId) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: React.SetStateAction<'asc' | 'desc'>) => void;
  filterDept: string;
  setFilterDept: (value: string) => void;
  onOpenScreening: () => void;
}

export function FilterToolbar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterDept,
  setFilterDept,
  onOpenScreening
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索候选人..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-bold"
          />
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => {
                if (sortBy === s.id) {
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(s.id);
                  setSortOrder('desc'); // Default to desc for new sort
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                sortBy === s.id 
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
              {sortBy === s.id && (
                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              )}
            </button>
          ))}
        </div>

        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-full sm:w-[140px] h-[34px] bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-wider hover:border-blue-500 transition-all focus:ring-2 focus:ring-blue-500/20">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <SelectValue placeholder="部门筛选" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept} className="text-[10px] font-black uppercase tracking-wider">
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 shadow-lg shadow-black/10 transition-all"
          onClick={onOpenScreening}
        >
          <BrainCircuit className="w-4 h-4" />
          AI 批量筛选
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all" onClick={() => toast.info('上传功能开发中')}>
          <Upload className="w-4 h-4" />
          上传简历
        </button>
      </div>
    </div>
  );
}
