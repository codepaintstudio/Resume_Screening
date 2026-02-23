import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Student, Stage } from '@/types';
import { DEPARTMENTS, STATUS_MAP, SortOptionId } from '@/config/constants';

import { useAppStore } from '@/store';
import { FilterToolbar } from './resume/FilterToolbar';
import { StudentTable } from './resume/StudentTable';
import { CandidateDrawer } from './resume/CandidateDrawer';
import { AIScreeningDialog } from './resume/AIScreeningDialog';
import { UploadResumeDialog } from './resume/UploadResumeDialog';
import { SyncMailDialog } from './resume/SyncMailDialog';

export function ResumeBank() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterDept, setFilterDept] = useState<string>(DEPARTMENTS[0]);
  const [sortBy, setSortBy] = useState<SortOptionId>('ai');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScreeningOpen, setIsScreeningOpen] = useState(false);
  const [screeningDept, setScreeningDept] = useState('all');
  const [promptConfig, setPromptConfig] = useState('');
  const [departments, setDepartments] = useState<string[]>([...DEPARTMENTS]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // 同步邮箱相关状态
  const [isSyncMailOpen, setIsSyncMailOpen] = useState(false);

  const searchParams = useSearchParams();
  const { currentUser } = useAppStore();

  // Handle URL candidateId parameter
  useEffect(() => {
    const candidateId = searchParams?.get('candidateId');
    if (candidateId && students.length > 0) {
      // Find student by ID (handling both string and number IDs if necessary)
      const targetStudent = students.find(s => String(s.id) === candidateId);
      if (targetStudent) {
        setSelectedStudent(targetStudent);
      } else {
        // If we can't find it in the current list, maybe we should fetch it individually?
        // For now, assuming it's in the list or we just ignore if not found.
      }
    }
  }, [searchParams, students]);

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
            const statusOrder: Record<Stage, number> = {
              pending: 5,
              to_be_scheduled: 4,
              pending_interview: 3,
              interviewing: 2,
              passed: 1,
              rejected: 0
            };
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

  // Backend API integration
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resumesRes, deptsRes] = await Promise.all([
        fetch('/api/resumes'),
        fetch('/api/departments')
      ]);

      if (resumesRes.ok) {
        const result = await resumesRes.json();
        // 处理分页格式的响应
        const resumesData = Array.isArray(result) ? result : (result.data || []);
        setStudents(resumesData);
      } else {
        throw new Error('Failed to fetch resumes');
      }

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(['全部部门', ...deptsData]);
      }
    } catch (error) {
      toast.error('获取数据失败');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (taskId: string | number, newStatus: keyof typeof STATUS_MAP) => {
    // Optimistic update
    const prevStudents = [...students];
    const prevSelected = selectedStudent;

    // Update selected student state
    setSelectedStudent(prev => prev ? {
      ...prev,
      status: newStatus
    } : null);

    // Update main list state
    setStudents(prev => prev.map(s =>
      s.id === taskId ? { ...s, status: newStatus } : s
    ));

    try {
      const res = await fetch(`/api/resumes/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          user: currentUser
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`状态已更新为：${STATUS_MAP[newStatus].label}`);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("更新状态失败");
      // Revert
      setStudents(prevStudents);
      setSelectedStudent(prevSelected);
    }
  };

  const handleStartScreening = async () => {
    toast.promise(
      fetch('/api/resumes/batch-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: screeningDept,
          prompt: promptConfig,
          user: currentUser
        })
      }).then(async (res) => {
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data;
      }),
      {
        loading: 'AI 正在批量筛选简历中...',
        success: (data) => {
          setIsScreeningOpen(false);
          // In a real app, we would refresh the list or update statuses here
          // For now, we just simulate a refresh
          return `筛选完成，已处理 ${data.data.screenedCount} 份简历`;
        },
        error: '筛选任务启动失败'
      }
    );
  };

  const handleUpload = async (files: File[], onProgress?: (current: number, total: number) => void) => {
    const createdStudents: Student[] = [];

    try {
      const total = files.length;
      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const newStudent: Student = {
          id: `new-${Date.now()}-${index}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          studentId: `2024${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1],
          major: '',
          class: '',
          gpa: (Math.random() * 1.5 + 2.5).toFixed(1),
          graduationYear: '',
          status: 'pending',
          tags: ['新上传'],
          aiScore: Math.floor(Math.random() * 20) + 80,
          submissionDate: new Date().toISOString().split('T')[0],
          experiences: []
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify({
          students: [newStudent],
          user: currentUser
        }));
        formData.append('resume', file);

        const res = await fetch('/api/resumes', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Upload failed');
        }

        const result = await res.json();
        if (result.data && Array.isArray(result.data)) {
          createdStudents.push(...result.data);
        }

        if (onProgress) {
          onProgress(index + 1, total);
        }
      }

      if (createdStudents.length > 0) {
        setStudents(prev => [...createdStudents, ...prev]);
      }
      toast.success(`成功上传 ${files.length} 份简历`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传失败，请重试');
    }
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
        onOpenSyncMail={() => setIsSyncMailOpen(true)}
        departments={departments}
        onRefresh={fetchData}
      />

      <StudentTable
        students={filteredStudents}
        onSelectStudent={setSelectedStudent}
        loading={loading}
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

      <SyncMailDialog
        open={isSyncMailOpen}
        onOpenChange={setIsSyncMailOpen}
        onSuccess={() => {
          fetchData(); // 同步成功后刷新列表
        }}
      />
    </div>
  );
}
