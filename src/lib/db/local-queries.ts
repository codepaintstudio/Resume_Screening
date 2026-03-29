import bcrypt from 'bcryptjs';
import * as schema from './schema';

type UserRecord = typeof schema.users.$inferSelect;
type EmailTemplateRecord = typeof schema.emailTemplates.$inferSelect;
type EmailHistoryRecord = typeof schema.emailHistory.$inferSelect;
type EmailConfigRecord = typeof schema.emailConfig.$inferSelect;
type ActivityLogRecord = typeof schema.activityLogs.$inferSelect;
type NotificationRecord = typeof schema.notifications.$inferSelect;
type CommentRecord = typeof schema.comments.$inferSelect;
type StudentRecord = typeof schema.students.$inferSelect & {
  skills?: { name: string; level: 'understanding' | 'familiar' | 'proficient' | 'skilled' | 'master' }[];
  summary?: string;
  experience?: string;
  education?: string;
};
type InterviewRecord = typeof schema.interviews.$inferSelect;
type GithubSettingsRecord = typeof schema.githubSettings.$inferSelect;
type ApiKeyRecord = typeof schema.apiKeys.$inferSelect;

type AiSettingsResponse = {
  vision: {
    endpoint: string;
    model: string;
    apiKey: string;
  };
  llm: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
};

type NotificationSettingsResponse = {
  webhookUrl: string;
  triggers: {
    new_resume: boolean;
    interview_reminder: boolean;
    offer_confirmed: boolean;
  };
};

type PlatformSettingsResponse = {
  departments: string[];
};

type ResumeImportSettingsResponse = {
  imapServer: string;
  port: string;
  account: string;
  authCode: string;
};

type Store = {
  users: UserRecord[];
  emailTemplates: EmailTemplateRecord[];
  emailHistory: EmailHistoryRecord[];
  emailConfig: EmailConfigRecord | null;
  activityLogs: ActivityLogRecord[];
  notifications: NotificationRecord[];
  comments: CommentRecord[];
  students: StudentRecord[];
  interviews: InterviewRecord[];
  aiSettings: AiSettingsResponse;
  githubSettings: GithubSettingsRecord;
  apiKeys: ApiKeyRecord[];
  notificationSettings: NotificationSettingsResponse;
  platformSettings: PlatformSettingsResponse;
  resumeImportSettings: ResumeImportSettingsResponse;
  counters: Record<string, number>;
};

const defaultDepartments = ['前端部', '后端部', 'UI部', '设计部', '产品部', '运维部', '测试部', '办公室'];
const defaultAvatar = '/uploads/avatars/avatar_1_1771040131275.png';

const clone = <T>(value: T): T => structuredClone(value);

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const toDate = (value?: Date | string | null) => {
  if (!value) return null;
  return value instanceof Date ? new Date(value) : new Date(value);
};

const sameDay = (left: Date | null | undefined, right: Date) => {
  if (!left) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
};

const calcChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
};

const createInitialStore = (): Store => {
  const adminPassword = bcrypt.hashSync('123456', 10);
  const memberPassword = bcrypt.hashSync('123456', 10);
  const interviewerPassword = bcrypt.hashSync('123456', 10);

  const users: UserRecord[] = [
    {
      id: 1,
      email: 'admin@mahui.com',
      name: '张老师',
      role: 'admin',
      password: adminPassword,
      avatar: defaultAvatar,
      department: '办公室',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: 2,
      email: 'hr@mahui.com',
      name: '李同学',
      role: 'member',
      password: memberPassword,
      avatar: '/uploads/avatars/avatar_9_1771126454860.png',
      department: '前端部',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
    {
      id: 3,
      email: 'interviewer@mahui.com',
      name: '王面试官',
      role: 'interviewer',
      password: interviewerPassword,
      avatar: '',
      department: '后端部',
      createdAt: daysAgo(18),
      updatedAt: daysAgo(2),
    },
  ];

  const students: StudentRecord[] = [
    {
      id: 1,
      name: '陈晨',
      studentId: '2023001',
      department: '前端部',
      major: '软件工程',
      className: '软工 2301',
      gpa: '3.8',
      graduationYear: '2027',
      status: 'pending',
      tags: ['React', 'TypeScript'],
      aiScore: '88.50',
      submissionDate: daysAgo(1),
      email: 'chenchen@example.com',
      phone: '13800000001',
      resumePdf: '/uploads/resumes/resume_1771050447843_2egkfc.pdf',
      experiences: [
        {
          id: 'exp-1',
          startDate: '2024-03',
          endDate: '2024-08',
          title: '前端项目负责人',
          description: '负责 React 项目开发与组件设计',
        },
      ],
      skills: [
        { name: 'React', level: 'proficient' },
        { name: 'TypeScript', level: 'proficient' },
      ],
      summary: '有完整项目经验，熟悉 React 生态。',
      experience: '担任课程项目负责人，协作经验丰富。',
      education: '本科在读',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: 2,
      name: '林夕',
      studentId: '2023002',
      department: '后端部',
      major: '计算机科学与技术',
      className: '计科 2302',
      gpa: '3.9',
      graduationYear: '2027',
      status: 'pending_interview',
      tags: ['Node.js', 'MySQL'],
      aiScore: '91.20',
      submissionDate: daysAgo(2),
      email: 'linxi@example.com',
      phone: '13800000002',
      resumePdf: '',
      experiences: [
        {
          id: 'exp-2',
          startDate: '2024-05',
          endDate: '2024-11',
          title: '后端开发',
          description: '负责 API 设计与数据库建模',
        },
      ],
      skills: [
        { name: 'Node.js', level: 'proficient' },
        { name: 'MySQL', level: 'familiar' },
      ],
      summary: '擅长接口开发与数据建模。',
      experience: '完成多个后端课程设计。',
      education: '本科在读',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
    {
      id: 3,
      name: '周岚',
      studentId: '2023003',
      department: 'UI部',
      major: '数字媒体技术',
      className: '数媒 2301',
      gpa: '3.7',
      graduationYear: '2027',
      status: 'interviewing',
      tags: ['Figma', 'Design System'],
      aiScore: '85.00',
      submissionDate: daysAgo(4),
      email: 'zhoulan@example.com',
      phone: '13800000003',
      resumePdf: '',
      experiences: [
        {
          id: 'exp-3',
          startDate: '2024-01',
          endDate: '2024-12',
          title: '视觉设计',
          description: '负责活动海报与页面视觉规范',
        },
      ],
      skills: [
        { name: 'Figma', level: 'proficient' },
      ],
      summary: '设计能力稳定，具备交互意识。',
      experience: '参与多项校内设计活动。',
      education: '本科在读',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    {
      id: 4,
      name: '何明',
      studentId: '2023004',
      department: '测试部',
      major: '软件工程',
      className: '软工 2303',
      gpa: '3.6',
      graduationYear: '2027',
      status: 'passed',
      tags: ['Testing', 'Automation'],
      aiScore: '89.00',
      submissionDate: daysAgo(7),
      email: 'heming@example.com',
      phone: '13800000004',
      resumePdf: '',
      experiences: [
        {
          id: 'exp-4',
          startDate: '2024-02',
          endDate: '2024-10',
          title: '测试工程实践',
          description: '负责测试用例设计与自动化脚本',
        },
      ],
      skills: [
        { name: 'Playwright', level: 'familiar' },
      ],
      summary: '重视质量保障，执行力强。',
      experience: '搭建过自动化测试流程。',
      education: '本科在读',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
    },
  ];

  const interviews: InterviewRecord[] = [
    {
      id: 1,
      studentId: 2,
      name: '林夕',
      major: '计算机科学与技术',
      department: '后端部',
      time: '19:30',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: '线上会议室 A',
      priority: 'high',
      stage: 'pending_interview',
      gpa: '3.9',
      aiScore: '91.20',
      tags: ['Node.js', 'MySQL'],
      email: 'linxi@example.com',
      phone: '13800000002',
      className: '计科 2302',
      skills: [
        { name: 'Node.js', level: 'proficient' },
        { name: 'MySQL', level: 'familiar' },
      ],
      experiences: students[1].experiences,
      interviewers: ['王面试官'],
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: 2,
      studentId: 3,
      name: '周岚',
      major: '数字媒体技术',
      department: 'UI部',
      time: '14:00',
      date: new Date(),
      location: '设计组会议室',
      priority: 'medium',
      stage: 'interviewing',
      gpa: '3.7',
      aiScore: '85.00',
      tags: ['Figma', 'Design System'],
      email: 'zhoulan@example.com',
      phone: '13800000003',
      className: '数媒 2301',
      skills: [
        { name: 'Figma', level: 'proficient' },
      ],
      experiences: students[2].experiences,
      interviewers: ['张老师'],
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
  ];

  const now = new Date();

  return {
    users,
    emailTemplates: [
      {
        id: 1,
        name: '面试通知',
        subject: '面试邀请通知',
        content: '您好，我们诚挚邀请您参加面试。',
        category: '通知',
        createdAt: daysAgo(10),
        updatedAt: daysAgo(3),
      },
    ],
    emailHistory: [
      {
        id: 1,
        templateName: '面试通知',
        subject: '面试邀请通知',
        content: '您好，我们诚挚邀请您参加面试。',
        recipients: [{ name: '林夕', email: 'linxi@example.com', status: 'success' }],
        recipientCount: 1,
        status: 'success',
        sentAt: daysAgo(1),
      },
    ],
    emailConfig: {
      id: 1,
      host: '',
      port: '',
      user: '',
      pass: '',
      updatedAt: now,
    },
    activityLogs: [
      {
        id: 1,
        user: '张老师',
        action: '导入了 4 份示例简历',
        time: '1小时前',
        timestamp: daysAgo(0),
        role: '管理员',
        avatar: defaultAvatar,
        userId: 1,
      },
      {
        id: 2,
        user: '王面试官',
        action: '安排了 2 场面试',
        time: '3小时前',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        role: '后端部',
        avatar: '',
        userId: 3,
      },
      {
        id: 3,
        user: '李同学',
        action: '更新了平台设置',
        time: '昨天',
        timestamp: daysAgo(1),
        role: '前端部',
        avatar: '/uploads/avatars/avatar_9_1771126454860.png',
        userId: 2,
      },
    ],
    notifications: [
      {
        id: 1,
        userId: null,
        type: 'system',
        title: '系统初始化完成',
        description: '本地演示数据已加载，可以直接登录体验。',
        time: '刚刚',
        timestamp: now,
        unread: '1',
      },
      {
        id: 2,
        userId: 1,
        type: 'interview',
        title: '新的面试安排',
        description: '林夕的面试已安排到明晚 19:30。',
        time: '20分钟前',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        unread: '1',
      },
    ],
    comments: [],
    students,
    interviews,
    aiSettings: {
      vision: {
        endpoint: '',
        model: 'vision-vk-v2',
        apiKey: '',
      },
      llm: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: '',
      },
    },
    githubSettings: {
      id: 1,
      clientId: '',
      clientSecret: '',
      organization: 'mahui-studio',
      personalAccessToken: '',
      updatedAt: now,
    },
    apiKeys: [
      {
        id: '1',
        name: 'HR Portal Integration',
        key: 'sk_live_51M...',
        created: '2024-02-15',
        expiresAt: '',
      },
    ],
    notificationSettings: {
      webhookUrl: '',
      triggers: {
        new_resume: true,
        interview_reminder: true,
        offer_confirmed: true,
      },
    },
    platformSettings: {
      departments: defaultDepartments,
    },
    resumeImportSettings: {
      imapServer: 'imap.exmail.qq.com',
      port: '993',
      account: '',
      authCode: '',
    },
    counters: {
      user: 3,
      emailTemplate: 1,
      emailHistory: 1,
      activityLog: 3,
      notification: 2,
      comment: 0,
      student: 4,
      interview: 2,
    },
  };
};

let store = createInitialStore();

const nextId = (key: keyof Store['counters']) => {
  store.counters[key] += 1;
  return store.counters[key];
};

export async function getUsers() {
  return clone(store.users);
}

export async function getUserById(id: number) {
  const user = store.users.find(item => item.id === id);
  return user ? [clone(user)] : [];
}

export async function getUserByEmail(email: string) {
  const user = store.users.find(item => item.email.toLowerCase() === email.toLowerCase());
  return user ? [clone(user)] : [];
}

export async function createUser(data: typeof schema.users.$inferInsert) {
  const id = nextId('user');
  const record: UserRecord = {
    id,
    email: data.email,
    name: data.name,
    role: data.role || 'member',
    password: data.password,
    avatar: data.avatar || '',
    department: data.department || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(record);
  return [clone(record)];
}

export async function updateUser(id: number, data: Partial<typeof schema.users.$inferInsert>) {
  const user = store.users.find(item => item.id === id);
  if (!user) return [];
  Object.assign(user, data, { updatedAt: new Date() });
  return [clone(user)];
}

export async function deleteUser(id: number) {
  store.users = store.users.filter(item => item.id !== id);
  return true;
}

export async function getInterviewers() {
  return clone(
    store.users.filter(item => item.role === 'interviewer' || item.role === 'member').map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      avatar: item.avatar,
      department: item.department,
    }))
  );
}

export async function getEmailTemplates() {
  return clone(store.emailTemplates);
}

export async function getEmailTemplateById(id: number) {
  const template = store.emailTemplates.find(item => item.id === id);
  return template ? [clone(template)] : [];
}

export async function createEmailTemplate(data: typeof schema.emailTemplates.$inferInsert) {
  const record: EmailTemplateRecord = {
    id: nextId('emailTemplate'),
    name: data.name,
    subject: data.subject,
    content: data.content,
    category: data.category,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.emailTemplates.push(record);
  return [clone(record)];
}

export async function updateEmailTemplate(id: number, data: Partial<typeof schema.emailTemplates.$inferInsert>) {
  const template = store.emailTemplates.find(item => item.id === id);
  if (!template) return [];
  Object.assign(template, data, { updatedAt: new Date() });
  return [clone(template)];
}

export async function deleteEmailTemplate(id: number) {
  store.emailTemplates = store.emailTemplates.filter(item => item.id !== id);
  return true;
}

export async function getEmailHistory() {
  return clone([...store.emailHistory].sort((a, b) => (a.sentAt?.getTime() || 0) - (b.sentAt?.getTime() || 0)));
}

export async function getEmailHistoryById(id: number) {
  const record = store.emailHistory.find(item => item.id === id);
  return record ? [clone(record)] : [];
}

export async function createEmailHistory(data: typeof schema.emailHistory.$inferInsert) {
  const record: EmailHistoryRecord = {
    id: nextId('emailHistory'),
    templateName: data.templateName,
    subject: data.subject,
    content: data.content,
    recipients: data.recipients || [],
    recipientCount: data.recipientCount || 0,
    status: data.status || 'success',
    sentAt: toDate(data.sentAt) || new Date(),
  };
  store.emailHistory.push(record);
  return [clone(record)];
}

export async function deleteEmailHistory(id: number) {
  store.emailHistory = store.emailHistory.filter(item => item.id !== id);
  return true;
}

export async function getEmailConfig() {
  return store.emailConfig ? clone(store.emailConfig) : null;
}

export async function createOrUpdateEmailConfig(data: typeof schema.emailConfig.$inferInsert) {
  store.emailConfig = {
    id: store.emailConfig?.id || 1,
    host: data.host || '',
    port: data.port || '',
    user: data.user || '',
    pass: data.pass || '',
    updatedAt: new Date(),
  };
  return [clone(store.emailConfig)];
}

export async function getActivityLogs(page: number = 1, limit: number = 10) {
  const sorted = [...store.activityLogs].sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  const offset = (page - 1) * limit;
  return {
    data: clone(sorted.slice(offset, offset + limit)),
    hasMore: offset + limit < sorted.length,
    total: sorted.length,
  };
}

export async function createActivityLog(data: typeof schema.activityLogs.$inferInsert) {
  const timestamp = toDate(data.timestamp) || new Date();
  const record: ActivityLogRecord = {
    id: nextId('activityLog'),
    user: data.user,
    action: data.action,
    time: data.time || formatRelativeTime(timestamp),
    timestamp,
    role: data.role || '',
    avatar: data.avatar || '',
    userId: data.userId ?? null,
  };
  store.activityLogs.push(record);
  return [clone(record)];
}

export async function getCommentsByStudentId(studentId: number) {
  return clone(
    store.comments
      .filter(item => item.studentId === studentId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
  );
}

export async function createComment(data: typeof schema.comments.$inferInsert) {
  const timestamp = toDate(data.timestamp) || new Date();
  const record: CommentRecord = {
    id: nextId('comment'),
    studentId: data.studentId,
    user: data.user,
    role: data.role || '',
    avatar: data.avatar || '',
    content: data.content,
    time: data.time || formatRelativeTime(timestamp),
    timestamp,
    userId: data.userId ?? null,
  };
  store.comments.push(record);
  return [clone(record)];
}

export async function deleteComment(id: number) {
  store.comments = store.comments.filter(item => item.id !== id);
  return true;
}

export async function getStudents() {
  return clone(store.students);
}

export async function getStudentById(id: number) {
  const student = store.students.find(item => item.id === id);
  return student ? [clone(student)] : [];
}

export async function getStudentsByStatus(status: string) {
  return clone(store.students.filter(item => item.status === status));
}

export async function getStudentsByDepartment(department: string) {
  return clone(store.students.filter(item => item.department === department));
}

export async function createStudent(data: typeof schema.students.$inferInsert) {
  const record: StudentRecord = {
    id: nextId('student'),
    name: data.name,
    studentId: data.studentId || '',
    department: data.department || '',
    major: data.major || '',
    className: data.className || '',
    gpa: data.gpa || '',
    graduationYear: data.graduationYear || '',
    status: data.status || 'pending',
    tags: data.tags || [],
    aiScore: data.aiScore || '0',
    submissionDate: toDate(data.submissionDate),
    email: data.email || '',
    phone: data.phone || '',
    resumePdf: data.resumePdf || '',
    experiences: data.experiences || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.students.push(record);
  return [clone(record)];
}

export async function updateStudent(id: number, data: Partial<typeof schema.students.$inferInsert>) {
  const student = store.students.find(item => item.id === id);
  if (!student) return [];
  Object.assign(student, data, { updatedAt: new Date() });
  if (data.submissionDate !== undefined) {
    student.submissionDate = toDate(data.submissionDate);
  }
  return [clone(student)];
}

export async function deleteStudent(id: number) {
  store.students = store.students.filter(item => item.id !== id);
  store.comments = store.comments.filter(item => item.studentId !== id);
  store.interviews = store.interviews.filter(item => item.studentId !== id);
  return true;
}

export async function getInterviews() {
  return clone(store.interviews);
}

export async function getUpcomingInterviews(limit: number = 10) {
  return clone(
    store.interviews
      .filter(item => (item.stage === 'pending_interview' || item.stage === 'interviewing') && !!item.date)
      .sort((a, b) => {
        const dateDelta = (a.date?.getTime() || 0) - (b.date?.getTime() || 0);
        if (dateDelta !== 0) return dateDelta;
        return (a.time || '').localeCompare(b.time || '');
      })
      .slice(0, limit)
  );
}

export async function getTodayInterviews() {
  const today = new Date();
  return clone(
    store.interviews
      .filter(item => sameDay(item.date || null, today) && (item.stage === 'pending_interview' || item.stage === 'interviewing'))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  );
}

export async function getInterviewById(id: number) {
  const interview = store.interviews.find(item => item.id === id);
  return interview ? [clone(interview)] : [];
}

export async function getInterviewsByStudentId(studentId: number) {
  return clone(store.interviews.filter(item => item.studentId === studentId));
}

export async function getInterviewsByStage(stage: string) {
  return clone(store.interviews.filter(item => item.stage === stage));
}

export async function createInterview(data: typeof schema.interviews.$inferInsert) {
  const record: InterviewRecord = {
    id: nextId('interview'),
    studentId: data.studentId,
    name: data.name,
    major: data.major || '',
    department: data.department || '',
    time: data.time || '',
    date: toDate(data.date),
    location: data.location || '',
    priority: data.priority || 'medium',
    stage: data.stage || 'pending',
    gpa: data.gpa || '',
    aiScore: data.aiScore || '0',
    tags: data.tags || [],
    email: data.email || '',
    phone: data.phone || '',
    className: data.className || '',
    skills: data.skills || [],
    experiences: data.experiences || [],
    interviewers: data.interviewers || [],
    createdAt: toDate(data.createdAt) || new Date(),
    updatedAt: toDate(data.updatedAt) || new Date(),
  };
  store.interviews.push(record);
  return [clone(record)];
}

export async function updateInterview(id: number, data: Partial<typeof schema.interviews.$inferInsert>) {
  const interview = store.interviews.find(item => item.id === id);
  if (!interview) return [];
  Object.assign(interview, data, { updatedAt: new Date() });
  if (data.date !== undefined) {
    interview.date = toDate(data.date);
  }
  return [clone(interview)];
}

export async function deleteInterview(id: number) {
  store.interviews = store.interviews.filter(item => item.id !== id);
  return true;
}

export async function getStudentStats() {
  const stats = {
    total: store.students.length,
    pending: 0,
    to_be_scheduled: 0,
    pending_interview: 0,
    interviewing: 0,
    passed: 0,
    rejected: 0,
  };
  for (const student of store.students) {
    if (student.status in stats) {
      stats[student.status as keyof typeof stats] += 1;
    }
  }
  return stats;
}

export async function getInterviewStats() {
  const stats = {
    total: store.interviews.length,
    pending: 0,
    to_be_scheduled: 0,
    pending_interview: 0,
    interviewing: 0,
    passed: 0,
    rejected: 0,
  };
  for (const interview of store.interviews) {
    if (interview.stage in stats) {
      stats[interview.stage as keyof typeof stats] += 1;
    }
  }
  return stats;
}

export async function batchCreateStudents(data: typeof schema.students.$inferInsert[]) {
  const created: StudentRecord[] = [];
  for (const item of data) {
    const [student] = await createStudent(item);
    if (student) created.push(student);
  }
  return created;
}

export async function batchUpdateStudentStatus(ids: number[], status: string) {
  for (const id of ids) {
    const student = store.students.find(item => item.id === id);
    if (student) {
      student.status = status as StudentRecord['status'];
      student.updatedAt = new Date();
    }
  }
  return true;
}

export async function getDepartmentDistribution() {
  const countMap = new Map<string, number>();
  for (const student of store.students) {
    if (student.department) {
      countMap.set(student.department, (countMap.get(student.department) || 0) + 1);
    }
  }

  const colorMap: Record<string, string> = {
    前端部: '#2563eb',
    后端部: '#8b5cf6',
    UI部: '#ec4899',
    设计部: '#f97316',
    产品部: '#14b8a6',
    运维部: '#64748b',
    测试部: '#84cc16',
    数据部: '#0ea5e9',
    算法部: '#a855f7',
    移动端: '#f43f5e',
    办公室: '#f59e0b',
  };

  if (countMap.size === 0) {
    return [
      { name: '前端部', value: 0, fill: '#2563eb' },
      { name: 'UI部', value: 0, fill: '#8b5cf6' },
      { name: '办公室', value: 0, fill: '#ec4899' },
      { name: '运维部', value: 0, fill: '#f97316' },
    ];
  }

  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      fill: colorMap[name] || '#64748b',
    }));
}

export async function getDashboardStats() {
  const inboxCount = store.students.filter(item => item.status === 'pending').length;
  const pendingCount = store.students.filter(item => item.status === 'to_be_scheduled' || item.status === 'pending_interview').length;

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const sevenDaysAgo = daysAgo(7);
  const fourteenDaysAgo = daysAgo(14);

  const passedCount = store.interviews.filter(item => item.stage === 'passed' && (item.updatedAt?.getTime() || 0) >= startOfWeek.getTime()).length;
  const userCount = store.users.length;

  const oldInboxCount = store.students.filter(item => item.status === 'pending' && (item.createdAt?.getTime() || 0) < sevenDaysAgo.getTime()).length;
  const oldPendingCount = store.students.filter(
    item =>
      (item.status === 'to_be_scheduled' || item.status === 'pending_interview') &&
      (item.createdAt?.getTime() || 0) < sevenDaysAgo.getTime()
  ).length;
  const oldPassedCount = store.interviews.filter(item => {
    const updatedAt = item.updatedAt?.getTime() || 0;
    return item.stage === 'passed' && updatedAt >= fourteenDaysAgo.getTime() && updatedAt < sevenDaysAgo.getTime();
  }).length;
  const oldUserCount = store.users.filter(item => (item.createdAt?.getTime() || 0) < sevenDaysAgo.getTime()).length;

  return {
    totalApplications: inboxCount,
    pending: pendingCount,
    passed: passedCount,
    totalInterviewers: userCount,
    totalChange: calcChange(inboxCount, oldInboxCount),
    pendingChange: calcChange(pendingCount, oldPendingCount),
    passedChange: calcChange(passedCount, oldPassedCount),
    interviewersChange: calcChange(userCount, oldUserCount),
  };
}

export async function getTrendData(days: number = 7) {
  const labels: string[] = [];
  const counts = new Map<string, number>();
  const today = new Date();
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    labels.push(label);
    counts.set(label, 0);
  }

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  for (const student of store.students) {
    const submissionDate = student.submissionDate;
    if (submissionDate && submissionDate >= startDate) {
      const label = `${String(submissionDate.getMonth() + 1).padStart(2, '0')}-${String(submissionDate.getDate()).padStart(2, '0')}`;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  }

  return labels.map(label => ({
    name: label,
    value: counts.get(label) || 0,
  }));
}

export async function getDepartments() {
  const set = new Set<string>();
  for (const department of store.platformSettings.departments) set.add(department);
  for (const student of store.students) if (student.department) set.add(student.department);
  for (const user of store.users) if (user.department) set.add(user.department);
  for (const interview of store.interviews) if (interview.department) set.add(interview.department);
  return Array.from(set.size > 0 ? set : new Set(defaultDepartments)).sort();
}

export async function getNotifications(userId?: number, limit = 20) {
  const filtered = userId === undefined
    ? store.notifications
    : store.notifications.filter(item => item.userId === null || item.userId === userId);
  return clone(
    [...filtered]
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit)
  );
}

export async function getUnreadNotificationCount(userId?: number) {
  const notifications = await getNotifications(userId, Number.MAX_SAFE_INTEGER);
  return notifications.filter(item => item.unread === '1').length;
}

export async function markNotificationAsRead(id: number) {
  const notification = store.notifications.find(item => item.id === id);
  if (!notification) return false;
  notification.unread = '0';
  return true;
}

export async function markAllNotificationsAsRead(userId?: number) {
  for (const notification of store.notifications) {
    if (notification.unread === '1' && (userId === undefined || notification.userId === null || notification.userId === userId)) {
      notification.unread = '0';
    }
  }
  return true;
}

export async function addNotification(notification: typeof schema.notifications.$inferInsert) {
  const record: NotificationRecord = {
    id: nextId('notification'),
    userId: notification.userId ?? null,
    type: notification.type,
    title: notification.title,
    description: notification.description || '',
    time: notification.time || '刚刚',
    timestamp: toDate(notification.timestamp) || new Date(),
    unread: notification.unread || '1',
  };
  store.notifications.push(record);
  return clone(record);
}

export async function getAiSettings() {
  return clone(store.aiSettings);
}

export async function createOrUpdateAiSettings(data: {
  vision?: {
    endpoint?: string;
    model?: string;
    apiKey?: string;
  };
  llm?: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  };
}) {
  store.aiSettings = {
    vision: {
      endpoint: data.vision?.endpoint ?? store.aiSettings.vision.endpoint,
      model: data.vision?.model ?? store.aiSettings.vision.model,
      apiKey: data.vision?.apiKey ?? store.aiSettings.vision.apiKey,
    },
    llm: {
      baseUrl: data.llm?.baseUrl ?? store.aiSettings.llm.baseUrl,
      apiKey: data.llm?.apiKey ?? store.aiSettings.llm.apiKey,
      model: data.llm?.model ?? store.aiSettings.llm.model,
    },
  };
  return clone(store.aiSettings);
}

export async function getGithubSettings() {
  return clone({
    clientId: store.githubSettings.clientId || '',
    clientSecret: store.githubSettings.clientSecret || '',
    organization: store.githubSettings.organization || '',
    personalAccessToken: store.githubSettings.personalAccessToken || '',
  });
}

export async function createOrUpdateGithubSettings(data: {
  clientId?: string;
  clientSecret?: string;
  organization?: string;
  personalAccessToken?: string;
}) {
  store.githubSettings = {
    ...store.githubSettings,
    clientId: data.clientId ?? store.githubSettings.clientId,
    clientSecret: data.clientSecret ?? store.githubSettings.clientSecret,
    organization: data.organization ?? store.githubSettings.organization,
    personalAccessToken: data.personalAccessToken ?? store.githubSettings.personalAccessToken,
    updatedAt: new Date(),
  };
  return getGithubSettings();
}

export async function getApiKeys() {
  return clone(store.apiKeys);
}

export async function createApiKey(data: typeof schema.apiKeys.$inferInsert) {
  const record: ApiKeyRecord = {
    id: data.id,
    name: data.name,
    key: data.key,
    created: data.created,
    expiresAt: data.expiresAt || '',
  };
  store.apiKeys.push(record);
  return clone(record);
}

export async function deleteApiKey(id: string) {
  store.apiKeys = store.apiKeys.filter(item => item.id !== id);
  return true;
}

export async function replaceApiKeys(keys: typeof schema.apiKeys.$inferInsert[]) {
  store.apiKeys = clone(
    keys.map(item => ({
      id: item.id,
      name: item.name,
      key: item.key,
      created: item.created,
      expiresAt: item.expiresAt || '',
    }))
  );
  return getApiKeys();
}

export async function getNotificationSettings() {
  return clone(store.notificationSettings);
}

export async function createOrUpdateNotificationSettings(data: {
  webhookUrl?: string;
  triggers?: {
    new_resume?: boolean;
    interview_reminder?: boolean;
    offer_confirmed?: boolean;
  };
}) {
  store.notificationSettings = {
    webhookUrl: data.webhookUrl ?? store.notificationSettings.webhookUrl,
    triggers: {
      new_resume: data.triggers?.new_resume ?? store.notificationSettings.triggers.new_resume,
      interview_reminder: data.triggers?.interview_reminder ?? store.notificationSettings.triggers.interview_reminder,
      offer_confirmed: data.triggers?.offer_confirmed ?? store.notificationSettings.triggers.offer_confirmed,
    },
  };
  return clone(store.notificationSettings);
}

export async function getPlatformSettings() {
  return clone(store.platformSettings);
}

export async function createOrUpdatePlatformSettings(data: {
  departments?: string[];
}) {
  store.platformSettings = {
    departments: data.departments ? [...data.departments] : store.platformSettings.departments,
  };
  return clone(store.platformSettings);
}

export async function getResumeImportSettings() {
  return clone(store.resumeImportSettings);
}

export async function createOrUpdateResumeImportSettings(data: {
  imapServer?: string;
  port?: string;
  account?: string;
  authCode?: string;
}) {
  store.resumeImportSettings = {
    imapServer: data.imapServer ?? store.resumeImportSettings.imapServer,
    port: data.port ?? store.resumeImportSettings.port,
    account: data.account ?? store.resumeImportSettings.account,
    authCode: data.authCode ?? store.resumeImportSettings.authCode,
  };
  return clone(store.resumeImportSettings);
}
