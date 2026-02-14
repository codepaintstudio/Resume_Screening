import { db, schema } from './index';
import { eq, sql } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';

// 辅助函数：获取最后插入的 ID
async function getLastInsertId(): Promise<number> {
  const result = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
  // 使用类型断言处理 MySQL result 类型
  const rows = (result as unknown as { rows: { id: number }[] }).rows;
  // 安全检查：确保 rows 存在且有数据
  if (!rows || rows.length === 0) {
    return 0;
  }
  return Number(rows[0]?.id || 0);
}

// ==================== 用户相关操作 ====================
export async function getUsers() {
  return await db.select().from(schema.users);
}

export async function getUserById(id: number) {
  const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return users[0] ? [users[0]] : [];
}

export async function getUserByEmail(email: string) {
  const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
  return users[0] ? [users[0]] : [];
}

export async function createUser(data: typeof schema.users.$inferInsert) {
  // 直接返回插入的结果，使用 returning 方式
  const result = await db.insert(schema.users).values(data);
  // 通过 lastInsertId 获取插入的记录，使用类型断言处理
  const insertResult = result as unknown as { lastInsertId: bigint | null };
  const insertId = Number(insertResult.lastInsertId);
  if (!insertId) {
    throw new Error('Failed to get insertId');
  }
  const users = await db.select().from(schema.users).where(eq(schema.users.id, insertId));
  return users;
}

export async function updateUser(id: number, data: Partial<typeof schema.users.$inferInsert>) {
  await db.update(schema.users).set(data).where(eq(schema.users.id, id));
  return await db.select().from(schema.users).where(eq(schema.users.id, id));
}

export async function deleteUser(id: number) {
  return await db.delete(schema.users).where(eq(schema.users.id, id));
}

// ==================== 邮件模板相关操作 ====================
export async function getEmailTemplates() {
  return await db.select().from(schema.emailTemplates);
}

export async function getEmailTemplateById(id: number) {
  return await db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.id, id));
}

export async function createEmailTemplate(data: typeof schema.emailTemplates.$inferInsert) {
  await db.insert(schema.emailTemplates).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.id, insertId));
}

export async function updateEmailTemplate(id: number, data: Partial<typeof schema.emailTemplates.$inferInsert>) {
  await db.update(schema.emailTemplates).set(data).where(eq(schema.emailTemplates.id, id));
  return await db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.id, id));
}

export async function deleteEmailTemplate(id: number) {
  return await db.delete(schema.emailTemplates).where(eq(schema.emailTemplates.id, id));
}

// ==================== 邮件历史相关操作 ====================
export async function getEmailHistory() {
  return await db.select().from(schema.emailHistory).orderBy(schema.emailHistory.sentAt);
}

export async function getEmailHistoryById(id: number) {
  return await db.select().from(schema.emailHistory).where(eq(schema.emailHistory.id, id));
}

export async function createEmailHistory(data: typeof schema.emailHistory.$inferInsert) {
  await db.insert(schema.emailHistory).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.emailHistory).where(eq(schema.emailHistory.id, insertId));
}

export async function deleteEmailHistory(id: number) {
  return await db.delete(schema.emailHistory).where(eq(schema.emailHistory.id, id));
}

// ==================== 邮件配置相关操作 ====================
export async function getEmailConfig() {
  const configs = await db.select().from(schema.emailConfig).limit(1);
  return configs[0] || null;
}

export async function createOrUpdateEmailConfig(data: typeof schema.emailConfig.$inferInsert) {
  // 先删除现有配置，再插入新配置（简化处理）
  await db.delete(schema.emailConfig);
  await db.insert(schema.emailConfig).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.emailConfig).where(eq(schema.emailConfig.id, insertId));
}

// ==================== 活动日志相关操作 ====================
export async function getActivityLogs(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;
  const logs = await db.select()
    .from(schema.activityLogs)
    .orderBy(sql`${schema.activityLogs.timestamp} DESC`)
    .limit(limit)
    .offset(offset);
  
  const countResult = await db.select({ count: schema.activityLogs.id }).from(schema.activityLogs);
  const total = countResult.length;
  
  return {
    data: logs,
    hasMore: offset + limit < total,
    total
  };
}

export async function createActivityLog(data: typeof schema.activityLogs.$inferInsert) {
  await db.insert(schema.activityLogs).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.activityLogs).where(eq(schema.activityLogs.id, insertId));
}

// ==================== 评论相关操作 ====================
export async function getCommentsByStudentId(studentId: number) {
  return await db.select()
    .from(schema.comments)
    .where(eq(schema.comments.studentId, studentId))
    .orderBy(sql`${schema.comments.timestamp} ASC`);
}

export async function createComment(data: typeof schema.comments.$inferInsert) {
  // 保存 timestamp 用于后续查询
  const timestamp = data.timestamp || new Date();
  
  console.log('createComment input data:', JSON.stringify(data));
  // 记录插入前的时间点，用于后续查询
  const beforeTime = new Date(timestamp.getTime() - 1000);
  
  try {
    await db.insert(schema.comments).values({
      ...data,
      timestamp: timestamp,
    });
    console.log('Comment inserted successfully');
  } catch (insertError) {
    console.error('Comment insert error:', insertError);
    throw insertError;
  }
  
  // 直接通过 studentId + userId + content + timestamp 范围查询刚插入的记录
  // 不使用 LAST_INSERT_ID()，因为它在连接池中可能不准确
  console.log('Searching for comment with:', {
    studentId: data.studentId,
    userId: data.userId,
    content: data.content,
    beforeTime,
    timestamp
  });
  
  const result = await db.select()
    .from(schema.comments)
    .where(
      sql`${schema.comments.studentId} = ${data.studentId} 
      AND ${schema.comments.userId} = ${data.userId}
      AND ${schema.comments.content} = ${data.content}
      AND ${schema.comments.timestamp} >= ${beforeTime}
      AND ${schema.comments.timestamp} <= ${timestamp}`
    )
    .orderBy(sql`${schema.comments.timestamp} DESC`)
    .limit(1);
  
  console.log('Query result:', result);
  
  if (!result || result.length === 0) {
    console.error('Failed to find inserted comment');
    // 尝试仅用 studentId 查询最新的评论
    const fallbackResult = await db.select()
      .from(schema.comments)
      .where(eq(schema.comments.studentId, data.studentId))
      .orderBy(sql`${schema.comments.timestamp} DESC`)
      .limit(1);
    console.log('Fallback query result:', fallbackResult);
    return fallbackResult || [];
  }
  
  return result;
}

export async function deleteComment(id: number) {
  return await db.delete(schema.comments).where(eq(schema.comments.id, id));
}

// ==================== 学生/简历相关操作 ====================
export async function getStudents() {
  return await db.select().from(schema.students);
}

export async function getStudentById(id: number) {
  return await db.select().from(schema.students).where(eq(schema.students.id, id));
}

export async function getStudentsByStatus(status: string) {
  return await db.select().from(schema.students).where(eq(schema.students.status, status as any));
}

export async function getStudentsByDepartment(department: string) {
  return await db.select().from(schema.students).where(eq(schema.students.department, department));
}

export async function createStudent(data: typeof schema.students.$inferInsert) {
  await db.insert(schema.students).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.students).where(eq(schema.students.id, insertId));
}

export async function updateStudent(id: number, data: Partial<typeof schema.students.$inferInsert>) {
  await db.update(schema.students).set(data).where(eq(schema.students.id, id));
  return await db.select().from(schema.students).where(eq(schema.students.id, id));
}

export async function deleteStudent(id: number) {
  return await db.delete(schema.students).where(eq(schema.students.id, id));
}

// ==================== 面试相关操作 ====================
export async function getInterviews() {
  return await db.select().from(schema.interviews);
}

export async function getInterviewById(id: number) {
  return await db.select().from(schema.interviews).where(eq(schema.interviews.id, id));
}

export async function getInterviewsByStudentId(studentId: number) {
  return await db.select().from(schema.interviews).where(eq(schema.interviews.studentId, studentId));
}

export async function getInterviewsByStage(stage: string) {
  return await db.select().from(schema.interviews).where(eq(schema.interviews.stage, stage as any));
}

export async function createInterview(data: typeof schema.interviews.$inferInsert) {
  await db.insert(schema.interviews).values(data);
  const insertId = await getLastInsertId();
  return await db.select().from(schema.interviews).where(eq(schema.interviews.id, insertId));
}

export async function updateInterview(id: number, data: Partial<typeof schema.interviews.$inferInsert>) {
  await db.update(schema.interviews).set(data).where(eq(schema.interviews.id, id));
  return await db.select().from(schema.interviews).where(eq(schema.interviews.id, id));
}

export async function deleteInterview(id: number) {
  return await db.delete(schema.interviews).where(eq(schema.interviews.id, id));
}

// ==================== 统计相关操作 ====================
export async function getStudentStats() {
  const allStudents = await db.select().from(schema.students);
  
  const stats = {
    total: allStudents.length,
    pending: 0,
    to_be_scheduled: 0,
    pending_interview: 0,
    interviewing: 0,
    passed: 0,
    rejected: 0,
  };
  
  for (const student of allStudents) {
    if (student.status in stats) {
      stats[student.status as keyof typeof stats]++;
    }
  }
  
  return stats;
}

export async function getInterviewStats() {
  const allInterviews = await db.select().from(schema.interviews);
  
  const stats = {
    total: allInterviews.length,
    pending: 0,
    to_be_scheduled: 0,
    pending_interview: 0,
    interviewing: 0,
    passed: 0,
    rejected: 0,
  };
  
  for (const interview of allInterviews) {
    if (interview.stage in stats) {
      stats[interview.stage as keyof typeof stats]++;
    }
  }
  
  return stats;
}

// ==================== 批量操作 ====================
export async function batchCreateStudents(data: typeof schema.students.$inferInsert[]) {
  await db.insert(schema.students).values(data);
  // 返回插入的所有记录
  const startId = await getLastInsertId();
  const endId = startId + data.length - 1;
  return await db.select().from(schema.students).where(sql`${schema.students.id} BETWEEN ${startId} AND ${endId}`);
}

export async function batchUpdateStudentStatus(ids: number[], status: string) {
  // 使用 in 条件批量更新
  return await db.update(schema.students)
    .set({ status: status as any })
    .where(sql`${schema.students.id} IN (${ids.join(',')})`);
}
