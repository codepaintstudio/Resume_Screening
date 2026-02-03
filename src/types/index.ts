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
  status: 'pending' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';
  tags: string[] | string; // DB might return string, frontend needs array
  aiScore: number;
  submissionDate: string;
  createdAt?: string | Date;
  experiences?: Experience[];
}

export type Stage = 'pending' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';

export interface InterviewTask {
  id: string;
  name: string;
  major: string;
  department: string;
  time: string;
  interviewer: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  stage: Stage;
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
