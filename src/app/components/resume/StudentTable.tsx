import React from 'react';
import { Mail, MoreHorizontal } from 'lucide-react';
import { Student } from '@/types';
import { STATUS_MAP, TABLE_HEADERS } from '@/config/constants';
import { Skeleton } from "@/app/components/ui/skeleton";
import { Checkbox } from "@/app/components/ui/checkbox";

interface StudentTableProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  loading?: boolean;
  selectedIds: (string | number)[];
  onToggleSelection: (id: string | number) => void;
  onSelectAll: (ids: (string | number)[]) => void;
}

function formatSubmissionTime(student: Student): string {
  const source = (student.createdAt as string | Date | undefined) || student.submissionDate;
  if (!source) return '-';
  const date = new Date(source);
  if (isNaN(date.getTime())) return typeof source === 'string' ? source : '-';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const yyyy = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${hh}:${mm}于${yyyy}/${m}/${d}`;
}

export function StudentTable({
  students,
  onSelectStudent,
  loading = false,
  selectedIds,
  onToggleSelection,
  onSelectAll
}: StudentTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Desktop Table Skeleton */}
        <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 md:px-6 py-4 w-10">
                    <Skeleton className="h-4 w-4" />
                  </th>
                  {TABLE_HEADERS.map((header, index) => (
                    <th key={index} className={`px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${header.className}`}>
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 md:px-6 py-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <Skeleton className="h-5 w-24 mb-2" />
                        <div className="flex gap-1">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <Skeleton className="h-8 w-12 mx-auto rounded-lg" />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <Skeleton className="h-5 w-10 mx-auto" />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-lg" />
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 md:px-6 py-4 w-10">
                  <Checkbox
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectAll(students.map(s => s.id));
                      } else {
                        onSelectAll([]);
                      }
                    }}
                  />
                </th>
                {TABLE_HEADERS.map((header, index) => (
                  <th key={index} className={`px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${header.className}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {students.map((student) => {
                const studentTags = Array.isArray(student.tags) ? student.tags : [student.tags].filter(Boolean);
                const isSelected = selectedIds.includes(student.id);

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => onSelectStudent(student)}
                  >
                    <td className="px-4 md:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(student.id)}
                      />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <div className="font-black text-slate-900 dark:text-white">{student.name}</div>
                        <div className="flex gap-1 mt-1">
                          {studentTags.map(tag => (
                            <span key={tag} className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center">
                      <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-black text-sm">
                        {student.aiScore}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <div className="font-bold text-slate-900 dark:text-white">{student.studentId}</div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">{student.department}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                      {formatSubmissionTime(student)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-center font-black text-slate-600 dark:text-slate-400">
                      {student.gpa}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${STATUS_MAP[student.status].color}`}>
                        {STATUS_MAP[student.status].label}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-300 hover:text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-300 hover:text-slate-600 shadow-sm border border-slate-100 dark:border-slate-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-3">
        {students.map((student) => {
          const studentTags = Array.isArray(student.tags) ? student.tags : [student.tags].filter(Boolean);
          const isSelected = selectedIds.includes(student.id);

          return (
            <div
              key={student.id}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all active:scale-[0.98] ${isSelected ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
              onClick={() => onSelectStudent(student)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 items-start">
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(student.id)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {student.name}
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${STATUS_MAP[student.status].color}`}>
                        {STATUS_MAP[student.status].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {studentTags.map(tag => (
                        <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-black text-xs">
                    {student.aiScore}
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">AI Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">学号 / 部门</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {student.studentId} · {student.department}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">绩点</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{student.gpa}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">申请日期</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatSubmissionTime(student)}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
