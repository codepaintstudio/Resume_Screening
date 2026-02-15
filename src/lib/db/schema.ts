import { mysqlTable, serial, varchar, text, int, timestamp, mysqlEnum, json, decimal, date, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ==================== Users 表 ====================
export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'member', 'interviewer']).notNull().default('member'),
  password: varchar('password', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  department: varchar('department', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ==================== Email Templates 表 ====================
export const emailTemplates = mysqlTable('email_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

// ==================== Email History 表 ====================
export const emailHistory = mysqlTable('email_history', {
  id: serial('id').primaryKey(),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  content: text('content').notNull(),
  // 使用 JSON 存储 recipients 数组
  recipients: json('recipients').$type<{ name: string; email?: string; status: string }[]>(),
  recipientCount: int('recipient_count').notNull().default(0),
  status: mysqlEnum('status', ['success', 'failed', 'partial']).notNull().default('success'),
  sentAt: timestamp('sent_at').defaultNow(),
});

export type EmailHistory = typeof emailHistory.$inferSelect;
export type NewEmailHistory = typeof emailHistory.$inferInsert;

// ==================== Email Config 表 ====================
export const emailConfig = mysqlTable('email_config', {
  id: serial('id').primaryKey(),
  host: varchar('host', { length: 255 }).notNull(),
  port: varchar('port', { length: 10 }).notNull(),
  user: varchar('user', { length: 255 }).notNull(),
  pass: varchar('pass', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type EmailConfigType = typeof emailConfig.$inferSelect;
export type NewEmailConfig = typeof emailConfig.$inferInsert;

// ==================== Activity Logs 表 ====================
export const activityLogs = mysqlTable('activity_logs', {
  id: serial('id').primaryKey(),
  user: varchar('user', { length: 255 }).notNull(),
  action: varchar('action', { length: 500 }).notNull(),
  time: varchar('time', { length: 50 }), // 显示用时间字符串
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  role: varchar('role', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  userId: int('user_id'), // 关联用户
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// ==================== AI Settings 表 ====================
export const aiSettings = mysqlTable('ai_settings', {
  id: serial('id').primaryKey(),
  visionEndpoint: varchar('vision_endpoint', { length: 500 }),
  visionModel: varchar('vision_model', { length: 100 }),
  visionApiKey: varchar('vision_api_key', { length: 500 }),
  llmBaseUrl: varchar('llm_base_url', { length: 500 }),
  llmApiKey: varchar('llm_api_key', { length: 500 }),
  llmModel: varchar('llm_model', { length: 100 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type AiSettings = typeof aiSettings.$inferSelect;
export type NewAiSettings = typeof aiSettings.$inferInsert;

// ==================== Notifications 表 ====================
export const notifications = mysqlTable('notifications', {
  id: serial('id').primaryKey(),
  userId: int('user_id'), // 关联用户，不指定则为全局通知
  type: varchar('type', { length: 50 }).notNull(), // interview, resume, system
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  time: varchar('time', { length: 50 }), // 显示用时间字符串
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  unread: mysqlEnum('unread', ['0', '1']).notNull().default('1'),
}, (table) => {
  return {
    userIdIdx: index('user_id_idx').on(table.userId),
    timestampIdx: index('timestamp_idx').on(table.timestamp),
    unreadIdx: index('unread_idx').on(table.unread),
  };
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// ==================== GitHub Settings 表 ====================
export const githubSettings = mysqlTable('github_settings', {
  id: serial('id').primaryKey(),
  clientId: varchar('client_id', { length: 255 }),
  clientSecret: varchar('client_secret', { length: 255 }),
  organization: varchar('organization', { length: 255 }),
  personalAccessToken: varchar('personal_access_token', { length: 500 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type GithubSettings = typeof githubSettings.$inferSelect;
export type NewGithubSettings = typeof githubSettings.$inferInsert;

// ==================== API Keys 表 ====================
export const apiKeys = mysqlTable('api_keys', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 255 }).notNull(),
  created: varchar('created', { length: 20 }).notNull(),
  expiresAt: varchar('expires_at', { length: 20 }),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// ==================== Notification Settings 表 ====================
export const notificationSettings = mysqlTable('notification_settings', {
  id: serial('id').primaryKey(),
  webhookUrl: varchar('webhook_url', { length: 500 }),
  triggerNewResume: mysqlEnum('trigger_new_resume', ['0', '1']).default('1'),
  triggerInterviewReminder: mysqlEnum('trigger_interview_reminder', ['0', '1']).default('1'),
  triggerOfferConfirmed: mysqlEnum('trigger_offer_confirmed', ['0', '1']).default('1'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type NewNotificationSettings = typeof notificationSettings.$inferInsert;

// ==================== Platform Settings 表 ====================
export const platformSettings = mysqlTable('platform_settings', {
  id: serial('id').primaryKey(),
  departments: text('departments'), // JSON 数组存储
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type NewPlatformSettings = typeof platformSettings.$inferInsert;

// ==================== Resume Import Settings 表 ====================
export const resumeImportSettings = mysqlTable('resume_import_settings', {
  id: serial('id').primaryKey(),
  imapServer: varchar('imap_server', { length: 255 }),
  port: varchar('port', { length: 10 }),
  account: varchar('account', { length: 255 }),
  authCode: varchar('auth_code', { length: 255 }), // 授权码
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type ResumeImportSettings = typeof resumeImportSettings.$inferSelect;
export type NewResumeImportSettings = typeof resumeImportSettings.$inferInsert;

// ==================== Comments 表 ====================
export const comments = mysqlTable('comments', {
  id: serial('id').primaryKey(),
  studentId: int('student_id').notNull(),
  user: varchar('user', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  content: text('content').notNull(),
  time: varchar('time', { length: 50 }), // 显示用时间字符串
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  userId: int('user_id'), // 关联用户
}, (table) => {
  return {
    studentIdIdx: index('student_id_idx').on(table.studentId),
  };
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// ==================== Students/Resumes 表 ====================
export const students = mysqlTable('students', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  studentId: varchar('student_id', { length: 50 }), // 学号
  department: varchar('department', { length: 255 }),
  major: varchar('major', { length: 255 }),
  className: varchar('class_name', { length: 100 }), // class 是保留字
  gpa: varchar('gpa', { length: 10 }),
  graduationYear: varchar('graduation_year', { length: 10 }),
  status: mysqlEnum('status', ['pending', 'to_be_scheduled', 'pending_interview', 'interviewing', 'passed', 'rejected']).notNull().default('pending'),
  tags: json('tags').$type<string[]>(),
  aiScore: decimal('ai_score', { precision: 5, scale: 2 }).default('0'),
  submissionDate: date('submission_date'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  // 简历 PDF 文件路径
  resumePdf: varchar('resume_pdf', { length: 500 }),
  // JSON 存储经历
  experiences: json('experiences').$type<{
    id?: string;
    startDate: string;
    endDate: string;
    title: string;
    description: string;
  }[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    statusIdx: index('status_idx').on(table.status),
    departmentIdx: index('department_idx').on(table.department),
  };
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;

// ==================== Interviews 表 ====================
export const interviews = mysqlTable('interviews', {
  id: serial('id').primaryKey(),
  studentId: int('student_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  major: varchar('major', { length: 255 }),
  department: varchar('department', { length: 255 }),
  time: varchar('time', { length: 50 }),
  date: date('interview_date'),
  location: varchar('location', { length: 255 }),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).notNull().default('medium'),
  stage: mysqlEnum('stage', ['pending', 'to_be_scheduled', 'pending_interview', 'interviewing', 'passed', 'rejected']).notNull().default('pending'),
  gpa: varchar('gpa', { length: 10 }),
  aiScore: decimal('ai_score', { precision: 5, scale: 2 }).default('0'),
  tags: json('tags').$type<string[]>(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  className: varchar('class_name', { length: 100 }),
  skills: json('skills').$type<{ name: string; level: 'understanding' | 'familiar' | 'proficient' | 'skilled' | 'master' }[]>(),
  experiences: json('experiences').$type<{
    id?: string;
    startDate: string;
    endDate: string;
    title: string;
    description: string;
  }[]>(),
  // 面试官信息 (JSON 数组存储)
  interviewers: json('interviewers').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
}, (table) => {
  return {
    studentIdIdx: index('student_id_idx').on(table.studentId),
    stageIdx: index('stage_idx').on(table.stage),
    dateIdx: index('date_idx').on(table.date),
  };
});

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

// ==================== Relations ====================
export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activityLogs),
  comments: many(comments),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  comments: many(comments),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  student: one(students, {
    fields: [interviews.studentId],
    references: [students.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  student: one(students, {
    fields: [comments.studentId],
    references: [students.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
