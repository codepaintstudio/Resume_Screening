import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Student } from '@/types';
import { mockStudents as initialMockStudents } from '@/data/mock';
import { DEPARTMENTS, STATUS_MAP, SortOptionId } from '@/config/constants';

import { FilterToolbar } from './resume/FilterToolbar';
import { StudentTable } from './resume/StudentTable';
import { CandidateDrawer } from './resume/CandidateDrawer';
import { AIScreeningDialog } from './resume/AIScreeningDialog';
import { UploadResumeDialog } from './resume/UploadResumeDialog';

export function ResumeBank() {
  const [students, setStudents] = useState<Student[]>(initialMockStudents);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterDept, setFilterDept] = useState(DEPARTMENTS[0]);
  const [sortBy, setSortBy] = useState<SortOptionId>('ai');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [screeningDept, setScreeningDept] = useState('all');
  const [promptConfig, setPromptConfig] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        // Filter by search query
        const studentTags = Array.isArray(student.tags) ? student.tags : [student.tags].filter(Boolean);
        const matchesSearch = 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId.includes(searchQuery) ||
          studentTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Filter by department
        const matchesDept = filterDept === DEPARTMENTS[0] || student.department === filterDept;

        return matchesSearch && matchesDept;
      })
      .sort((a, b) => {
        let diff = 0;
        switch (sortBy) {
          case 'ai':
            diff = a.aiScore - b.aiScore;
            break;
          case 'gpa':
            diff = parseFloat(a.gpa) - parseFloat(b.gpa);
            break;
          case 'time':
            // Sort by submissionDate string (YYYY-MM-DD)
            const dateA = new Date(a.submissionDate || '').getTime();
            const dateB = new Date(b.submissionDate || '').getTime();
            diff = dateA - dateB;
            break;
          case 'status':
            // Custom order for status: pending > interviewing > passed > rejected
            const statusOrder = { pending: 3, interviewing: 2, passed: 1, rejected: 0 };
            const statusA = statusOrder[a.status] || 0;
            const statusB = statusOrder[b.status] || 0;
            diff = statusA - statusB;
            break;
          default:
            diff = 0;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [students, searchQuery, filterDept, sortBy, sortOrder]);

  useEffect(() => {
    // Backend API integration pending
    setLoading(false);
  }, []);

  const handleStatusChange = (taskId: string | number, newStatus: keyof typeof STATUS_MAP) => {
    toast.success(`状态已更新为：${STATUS_MAP[newStatus].label}`);
    
    // Update selected student state
    setSelectedStudent(prev => prev ? { 
      ...prev, 
      status: newStatus 
    } : null);

    // Update main list state
    setStudents(prev => prev.map(s => 
      s.id === taskId ? { ...s, status: newStatus } : s
    ));
  };

  const handleStartScreening = () => {
    toast.success('AI 批量筛选任务已创建');
    setIsScreeningOpen(false);
  };

  const handleUpload = (files: File[]) => {
    const newStudents: Student[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      studentId: `2024${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1],
      submissionDate: new Date().toISOString().split('T')[0],
      gpa: (Math.random() * 1.5 + 2.5).toFixed(1),
      aiScore: Math.floor(Math.random() * 20) + 80,
      status: 'pending' as const,
      tags: ['新上传'],
      email: 'candidate@example.com',
      phone: '13800000000',
      skills: [],
      experience: []
    }));
    
    setStudents(prev => [...newStudents, ...prev]);
    toast.success(`成功上传 ${files.length} 份简历`);
    setIsUploadOpen(false);
  };

  return (
    <div className="space-y-6">
      <FilterToolbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filterDept={filterDept}
        setFilterDept={setFilterDept}
        onOpenScreening={() => setIsScreeningOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <StudentTable 
        students={filteredStudents}
        onSelectStudent={setSelectedStudent}
      />

      <CandidateDrawer 
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onStatusChange={handleStatusChange}
      />

      <AIScreeningDialog 
        open={isScreeningOpen}
        onOpenChange={setIsScreeningOpen}
        dateRange={dateRange}
        setDateRange={setDateRange}
        screeningDept={screeningDept}
        setScreeningDept={setScreeningDept}
        promptConfig={promptConfig}
        setPromptConfig={setPromptConfig}
        onStartScreening={handleStartScreening}
      />

      <UploadResumeDialog 
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={handleUpload}
      />
    </div>
  );
}
