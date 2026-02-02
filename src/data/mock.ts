import { Student } from '@/types';

export const mockStudents: Student[] = [
  { id: '1', name: '张子涵', studentId: '2021001', department: '前端部', major: '软件工程', class: '2101班', gpa: '3.9', graduationYear: '2025', status: 'pending', tags: ['React', 'Three.js'], aiScore: 92, submissionDate: '2024-03-15' },
  { id: '2', name: '李思源', studentId: '2021045', department: 'UI部', major: '视觉传达', class: '2102班', gpa: '3.7', graduationYear: '2025', status: 'pending', tags: ['Figma', 'C4D'], aiScore: 88, submissionDate: '2024-03-16' },
  { id: '3', name: '王梦洁', studentId: '2022012', department: '办公室', major: '行政管理', class: '2201班', gpa: '3.8', graduationYear: '2026', status: 'passed', tags: ['文案策划'], aiScore: 85, submissionDate: '2024-03-14' },
  { id: '4', name: '赵天宇', studentId: '2021088', department: '运维', major: '信息安全', class: '2103班', gpa: '3.95', graduationYear: '2025', status: 'interviewing', tags: ['Docker', 'K8s'], aiScore: 94, submissionDate: '2024-03-17' },
];
