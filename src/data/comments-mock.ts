
export interface Comment {
  id: string;
  user: string;
  role: string;
  avatar: string;
  content: string;
  time: string; // Display time string for simplicity in mock
  timestamp: number; // For sorting
  studentId: string;
}

// Initial mock comments
const initialComments: Comment[] = [
  {
    id: '1',
    studentId: '1', // Assign to some student
    user: 'Admin',
    role: '面试官',
    avatar: 'M',
    content: '该候选人的 GitHub 提交记录非常活跃，建议面试时重点考察项目实践。',
    time: '2小时前',
    timestamp: Date.now() - 7200000
  },
  {
    id: '2',
    studentId: '1',
    user: 'LiHua',
    role: 'UI组长',
    avatar: 'L',
    content: '作品集很有创意，但是对移动端适配的细节处理还需要确认一下。',
    time: '5小时前',
    timestamp: Date.now() - 18000000
  },
  {
    id: '3',
    studentId: '1',
    user: 'System',
    role: '系统',
    avatar: 'S',
    content: 'AI 自动评估完成，评分：92分。关键词匹配度高。',
    time: '1天前',
    timestamp: Date.now() - 86400000
  }
];

// In-memory store
let commentsStore = [...initialComments];

export function getComments(studentId: string): Comment[] {
  // If no comments for this student, maybe generate some random ones or return empty
  // For demo purposes, we can share the initial ones if studentId matches, or return empty
  // Let's just return matches
  let matches = commentsStore.filter(c => c.studentId === studentId);
  
  // If empty and it's a "demo" ID (like 1, 2, 3), maybe we want to show something?
  // But for now, let's stick to what we have.
  // Actually, the original API logic was: "Randomly return 1-3 comments based on ID"
  // We can keep that logic for *initial* population if we want, but let's be more consistent.
  
  // To preserve the "randomness" of the original mock but make it persistent:
  if (matches.length === 0 && parseInt(studentId) < 100) {
      // Generate some default comments for this student so they have something
      const count = (parseInt(studentId) || 0) % 3 + 1;
      const defaults = initialComments.slice(0, count).map(c => ({
          ...c,
          id: `${studentId}-${c.id}`,
          studentId
      }));
      commentsStore.push(...defaults);
      matches = defaults;
  }
  
  return matches.sort((a, b) => a.timestamp - b.timestamp);
}

export function addComment(comment: Omit<Comment, 'id' | 'time' | 'timestamp'>): Comment {
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    time: '刚刚',
    timestamp: Date.now()
  };
  commentsStore.push(newComment);
  return newComment;
}
