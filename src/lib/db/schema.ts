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
