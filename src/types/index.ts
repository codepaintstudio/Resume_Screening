export interface Experience {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
}

export interface Student {
  id: string | number;
  name: string;
  studentId: string;
  department: string;
  major: string;
  class: string;
  gpa: string;
  graduationYear: string;
  status: 'pending' | 'to_be_scheduled' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';
  tags: string[] | string; // DB might return string, frontend needs array
  aiScore: number;
  submissionDate: string;
  createdAt?: string | Date;
  experiences?: Experience[];
  resumePdf?: string; // 简历 PDF 文件路径
}

export type Stage = 'pending' | 'to_be_scheduled' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';

export interface InterviewTask {
  id: string;
  name: string;
  major: string;
  department: string;
  time: string;
  interviewer?: string; // @deprecated use interviewers instead
  interviewers: string[];
  date?: string; // YYYY-MM-DD
  location: string;
  priority: 'low' | 'medium' | 'high';
  stage: Stage;
  role?: string;
  studentId: string;
  gpa: string;
  aiScore: number;
  tags: string[];
  email?: string;
  phone?: string;
  class?: string;
  skills?: { name: string; level: 'understanding' | 'familiar' | 'proficient' | 'skilled' | 'master' }[];
  experiences?: Experience[];
}
