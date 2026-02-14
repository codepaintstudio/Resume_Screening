import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Student } from '@/types';
import { DEPARTMENTS, STATUS_MAP, SortOptionId } from '@/config/constants';

import { useAppStore } from '@/store';
import { FilterToolbar } from './resume/FilterToolbar';
import { StudentTable } from './resume/StudentTable';
import { CandidateDrawer } from './resume/CandidateDrawer';
import { AIScreeningDialog } from './resume/AIScreeningDialog';
import { UploadResumeDialog } from './resume/UploadResumeDialog';

export function ResumeBank() {
  const [students, setStudents] = useState<Student[]>([]);
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
  const [departments, setDepartments] = useState<string[]>([...DEPARTMENTS]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const searchParams = useSearchParams();
  const { currentUser } = useAppStore();

  // Handle URL candidateId parameter
  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    if (candidateId && students.length > 0) {
      // Find student by ID (handling both string and number IDs if necessary)
      // Since MOCK_CANDIDATES use '1', '2' etc, and real students might have different IDs.
      // We'll try to match loosely.
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

  const handleUpload = async (files: File[]) => {
    try {
      // 只处理第一个 PDF 文件（目前的 API 设计是批量创建但只支持一个 PDF）
      const pdfFile = files.find(f => f.type === 'application/pdf');
      
      // 准备学生数据
      const newStudents = files.map((file, index) => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        studentId: `2024${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        department: DEPARTMENTS[Math.floor(Math.random() * (DEPARTMENTS.length - 1)) + 1],
        gpa: (Math.random() * 1.5 + 2.5).toFixed(1),
        status: 'pending' as const,
        tags: ['新上传'],
        email: 'candidate@example.com',
        phone: '13800000000',
      }));

      let res: Response;
      
      if (pdfFile) {
        // 使用 FormData 上传 PDF 文件
        const formData = new FormData();
        formData.append('data', JSON.stringify({ students: newStudents }));
        formData.append('resume', pdfFile);

        res = await fetch('/api/resumes', {
          method: 'POST',
          body: formData
        });
      } else {
        // 如果没有 PDF，使用 JSON 上传
        res = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            students: newStudents
          })
        });
      }
      
      if (res.ok) {
        const result = await res.json();
        // 将新创建的学生添加到列表
        if (result.data && Array.isArray(result.data)) {
          setStudents(prev => [...result.data, ...prev]);
        }
        toast.success(`成功上传 ${files.length} 份简历`);
        setIsUploadOpen(false);
      } else {
        throw new Error('Upload failed');
      }
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
    </div>
  );
}
