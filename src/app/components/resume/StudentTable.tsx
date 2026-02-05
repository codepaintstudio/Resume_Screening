import React from 'react';
import { Mail, MoreHorizontal } from 'lucide-react';
import { Student } from '@/types';
import { STATUS_MAP, TABLE_HEADERS } from '@/config/constants';
import { Skeleton } from "@/app/components/ui/skeleton";

interface StudentTableProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  loading?: boolean;
}

export function StudentTable({ students, onSelectStudent, loading = false }: StudentTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
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
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
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
              
              return (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  onClick={() => onSelectStudent(student)}
                >
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
                    {student.submissionDate || '-'}
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
  );
}
