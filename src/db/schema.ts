import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const candidates = sqliteTable('candidates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  studentId: text('student_id').notNull(),
  department: text('department'),
  major: text('major'),
  class: text('class'),
  gpa: text('gpa'),
  status: text('status').default('pending'),
  aiScore: integer('ai_score'),
  tags: text('tags'), // JSON string or comma separated
  graduationYear: text('graduation_year'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});
