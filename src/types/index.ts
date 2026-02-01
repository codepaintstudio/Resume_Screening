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
  createdAt?: string | Date;
}
