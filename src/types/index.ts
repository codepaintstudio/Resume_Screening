export interface Student {
  id: string | number;
  name: string;
  studentId: string;
  department: string;
  major: string;
  class: string;
  gpa: string;
  graduationYear: string;
  status: 'pending' | 'interviewing' | 'passed' | 'rejected';
  tags: string[] | string; // DB might return string, frontend needs array
  aiScore: number;
  submissionDate: string;
  createdAt?: string | Date;
}

export type Stage = 'pending' | 'interviewing' | 'passed' | 'rejected';

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
}
