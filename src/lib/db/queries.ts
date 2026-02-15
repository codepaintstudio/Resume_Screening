import { db, schema } from './index';
import { eq, and, sql, count, gt, lt, gte, or, asc, like, isNotNull, desc, isNull } from 'drizzle-orm';
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

// ==================== 面试官相关操作 ====================
// 获取所有面试官（role 为 interviewer 或 member 的用户）
export async function getInterviewers() {
  const result = await db.select({
    id: schema.users.id,
    name: schema.users.name,
    email: schema.users.email,
    role: schema.users.role,
    avatar: schema.users.avatar,
    department: schema.users.department,
  }).from(schema.users).where(
    or(
      eq(schema.users.role, 'interviewer'),
      eq(schema.users.role, 'member')
    )
  );
  return result;
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
  try {
    const offset = (page - 1) * limit;
    
    // 检查 activity_logs 表是否存在并可查询
    let logs: any[] = [];
    let total = 0;
    
    try {
      logs = await db.select()
        .from(schema.activityLogs)
        .orderBy(sql`${schema.activityLogs.timestamp} DESC`)
        .limit(limit)
        .offset(offset);
      
      // 使用 COUNT 函数正确获取总数
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM activity_logs`);
      const rows = (countResult as unknown as { rows?: { count: bigint }[] })?.rows;
      total = Number(rows?.[0]?.count || 0);
    } catch (tableError) {
      // 表可能不存在，返回空数据
      console.warn('activity_logs table error:', tableError);
      logs = [];
      total = 0;
    }
    
    return {
      data: logs,
      hasMore: offset + limit < total,
      total
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return {
      data: [],
      hasMore: false,
      total: 0
    };
  }
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
// 获取所有面试
export async function getInterviews() {
  return await db.select().from(schema.interviews);
}

// 获取近期面试（已安排但未开始的面试）
export async function getUpcomingInterviews(limit: number = 10) {
  // 获取状态为 pending_interview 或 interviewing，且有日期的面试
  // 按日期升序排列
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db.select()
    .from(schema.interviews)
    .where(
      and(
        or(
          eq(schema.interviews.stage, 'pending_interview'),
          eq(schema.interviews.stage, 'interviewing')
        ),
        isNotNull(schema.interviews.date)
      )
    )
    .orderBy(asc(schema.interviews.date), asc(schema.interviews.time))
    .limit(limit);
    
  return result;
}

// 获取今日面试
export async function getTodayInterviews() {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const result = await db.select()
    .from(schema.interviews)
    .where(
      and(
        eq(schema.interviews.date, todayDate),
        or(
          eq(schema.interviews.stage, 'pending_interview'),
          eq(schema.interviews.stage, 'interviewing')
        )
      )
    )
    .orderBy(asc(schema.interviews.time));
    
  return result;
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

// ==================== 部门分布统计 ====================
export async function getDepartmentDistribution() {
  // 使用 Drizzle ORM 的查询构建器
  const result = await db
    .select({
      name: schema.students.department,
      value: count(),
    })
    .from(schema.students)
    .where(
      sql`${schema.students.department} IS NOT NULL AND ${schema.students.department} != ''`
    )
    .groupBy(schema.students.department)
    .orderBy(sql`COUNT(*) DESC`);
  
  // 定义颜色映射
  const colorMap: Record<string, string> = {
    '前端部': '#2563eb',
    '后端部': '#8b5cf6',
    'UI部': '#ec4899',
    '设计部': '#f97316',
    '产品部': '#14b8a6',
    '运维部': '#64748b',
    '测试部': '#84cc16',
    '数据部': '#0ea5e9',
    '算法部': '#a855f7',
    '移动端': '#f43f5e',
  };
  
  // 如果没有部门数据，返回默认分布
  if (!result || result.length === 0) {
    return [
      { name: '前端部', value: 0, fill: '#2563eb' },
      { name: 'UI部', value: 0, fill: '#8b5cf6' },
      { name: '办公室', value: 0, fill: '#ec4899' },
      { name: '运维', value: 0, fill: '#f97316' },
    ];
  }
  
  // 格式化返回数据
  return result.map(row => ({
    name: row.name || '',
    value: row.value,
    fill: colorMap[row.name || ''] || '#64748b'
  }));
}

// ==================== 仪表盘综合统计 ====================
export async function getDashboardStats() {
  // 获取收件箱简历数量 (新投递的简历，状态为 pending)
  const inboxResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(eq(schema.students.status, 'pending'));
  const inboxCount = inboxResult[0]?.count || 0;

  // 获取待面试数量 (已安排面试但还未面试: to_be_scheduled + pending_interview)
  const toBeScheduledResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(eq(schema.students.status, 'to_be_scheduled'));
  const pendingInterviewResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(eq(schema.students.status, 'pending_interview'));
  const pendingCount = (toBeScheduledResult[0]?.count || 0) + 
                       (pendingInterviewResult[0]?.count || 0);

  // 获取本周通过数量 (本周新增的通过数)
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // 本周第一天(周日)
  startOfWeek.setHours(0, 0, 0, 0);

  const passedResult = await db
    .select({ count: count() })
    .from(schema.interviews)
    .where(
      and(
        eq(schema.interviews.stage, 'passed'),
        gte(schema.interviews.updatedAt, startOfWeek)
      )
    );
  const passedCount = passedResult[0]?.count || 0;

  // 获取面试官数量 (用户总数)
  const usersResult = await db
    .select({ count: count() })
    .from(schema.users);
  const userCount = usersResult[0]?.count || 0;

  // 计算变化百分比（与上周同期对比）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // 7天前的收件箱数量
  const oldInboxResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(
      and(
        eq(schema.students.status, 'pending'),
        lt(schema.students.createdAt, sevenDaysAgo)
      )
    );
  const oldInboxCount = oldInboxResult[0]?.count || 0;

  // 7天前的待面试数量
  const oldToBeScheduledResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(
      and(
        eq(schema.students.status, 'to_be_scheduled'),
        lt(schema.students.createdAt, sevenDaysAgo)
      )
    );
  const oldPendingInterviewResult = await db
    .select({ count: count() })
    .from(schema.students)
    .where(
      and(
        eq(schema.students.status, 'pending_interview'),
        lt(schema.students.createdAt, sevenDaysAgo)
      )
    );
  const oldPendingCount = (oldToBeScheduledResult[0]?.count || 0) + 
                          (oldPendingInterviewResult[0]?.count || 0);

  // 上周同期的通过数量
  const oldPassedResult = await db
    .select({ count: count() })
    .from(schema.interviews)
    .where(
      and(
        eq(schema.interviews.stage, 'passed'),
        and(
          gte(schema.interviews.updatedAt, fourteenDaysAgo),
          lt(schema.interviews.updatedAt, sevenDaysAgo)
        )
      )
    );
  const oldPassedCount = oldPassedResult[0]?.count || 0;

  // 7天前的面试官数量
  const oldUsersResult = await db
    .select({ count: count() })
    .from(schema.users)
    .where(lt(schema.users.createdAt, sevenDaysAgo));
  const oldUserCount = oldUsersResult[0]?.count || 0;

  // 计算变化百分比
  const calcChange = (current: number, old: number): string => {
    if (old === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - old) / old) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const inboxChange = calcChange(inboxCount, oldInboxCount);
  const pendingChange = calcChange(pendingCount, oldPendingCount);
  const passedChange = calcChange(passedCount, oldPassedCount);
  const interviewersChange = calcChange(userCount, oldUserCount);

  return {
    totalApplications: inboxCount,  // 收件箱 = 待处理的新简历
    pending: pendingCount,            // 待面试
    passed: passedCount,              // 本周通过
    totalInterviewers: userCount,    // 面试官总数
    totalChange: inboxChange,
    pendingChange: pendingChange,
    passedChange: passedChange,
    interviewersChange: interviewersChange
  };
}

// ==================== 趋势数据 ====================
export async function getTrendData(days: number = 7) {
  // 生成最近 days 天的日期列表
  const dateList: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateList.push(`${month}-${day}`);
  }

  // 查询最近 days 天的投递数据
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days + 1);
  
  // 使用 Drizzle ORM 查询
  const result = await db
    .select({
      date: sql<string>`DATE_FORMAT(${schema.students.submissionDate}, '%m-%d')`,
      count: count(),
    })
    .from(schema.students)
    .where(gte(schema.students.submissionDate, startDate))
    .groupBy(sql`DATE_FORMAT(${schema.students.submissionDate}, '%m-%d')`)
    .orderBy(sql`DATE_FORMAT(${schema.students.submissionDate}, '%m-%d')`);
  
  // 创建日期到数量的映射
  const countMap = new Map<string, number>();
  for (const row of result) {
    countMap.set(row.date || '', Number(row.count));
  }

  // 填充数据，缺少的日期值为0
  return dateList.map(date => ({
    name: date,
    value: countMap.get(date) || 0
  }));
}

// ==================== 部门列表 ====================
export async function getDepartments() {
  try {
    // 从 students 表中获取不同的部门
    let studentRows: { department: string | null }[] = [];
    try {
      const studentResult = await db
        .selectDistinct({ department: schema.students.department })
        .from(schema.students)
        .where(
          sql`${schema.students.department} IS NOT NULL AND ${schema.students.department} != ''`
        )
        .orderBy(schema.students.department);
      studentResult.forEach(row => {
        if (row.department) studentRows.push(row);
      });
    } catch (e) {
      console.warn('students table query failed:', e);
    }
    
    // 从 users 表中获取不同的部门
    let userRows: { department: string | null }[] = [];
    try {
      const userResult = await db
        .selectDistinct({ department: schema.users.department })
        .from(schema.users)
        .where(
          sql`${schema.users.department} IS NOT NULL AND ${schema.users.department} != ''`
        )
        .orderBy(schema.users.department);
      userResult.forEach(row => {
        if (row.department) userRows.push(row);
      });
    } catch (e) {
      console.warn('users table query failed:', e);
    }
    
    // 从 interviews 表中获取不同的部门
    let interviewRows: { department: string | null }[] = [];
    try {
      const interviewResult = await db
        .selectDistinct({ department: schema.interviews.department })
        .from(schema.interviews)
        .where(
          sql`${schema.interviews.department} IS NOT NULL AND ${schema.interviews.department} != ''`
        )
        .orderBy(schema.interviews.department);
      interviewResult.forEach(row => {
        if (row.department) interviewRows.push(row);
      });
    } catch (e) {
      console.warn('interviews table query failed:', e);
    }
    
    // Merge all departments and deduplicate
    const departmentSet = new Set<string>();
    
    for (const row of studentRows) {
      if (row.department) departmentSet.add(row.department);
    }
    for (const row of userRows) {
      if (row.department) departmentSet.add(row.department);
    }
    for (const row of interviewRows) {
      if (row.department) departmentSet.add(row.department);
    }
    
    // If no data, return default department list
    if (departmentSet.size === 0) {
      return ['前端部', 'UI部', '运维', '办公室', '后端部', '产品部', '设计部', '测试部'];
    }
    
    return Array.from(departmentSet).sort();
  } catch (error) {
    console.error('Error fetching departments:', error);
    // 返回默认部门列表而不是抛出错误
    return ['前端部', 'UI部', '运维', '办公室', '后端部', '产品部', '设计部', '测试部'];
  }
}

// ==================== Notifications 通知 ====================

/**
 * 获取通知列表
 */
export async function getNotifications(userId?: number, limit = 20) {
  try {
    let query = db.select().from(schema.notifications);
    
    if (userId !== undefined) {
      // 获取指定用户或全局通知（userId 为 null）
      return await query
        .where(or(eq(schema.notifications.userId, userId), isNull(schema.notifications.userId)))
        .orderBy(desc(schema.notifications.timestamp))
        .limit(limit);
    }
    
    // 获取所有通知
    return await query
      .orderBy(desc(schema.notifications.timestamp))
      .limit(limit);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * 获取未读通知数量
 */
export async function getUnreadNotificationCount(userId?: number) {
  try {
    if (userId !== undefined) {
      const result = await db.select({ count: count() })
        .from(schema.notifications)
        .where(
          and(
            eq(schema.notifications.unread, '1'),
            or(eq(schema.notifications.userId, userId), isNull(schema.notifications.userId))
          )
        );
      return result[0]?.count || 0;
    } else {
      const result = await db.select({ count: count() })
        .from(schema.notifications)
        .where(eq(schema.notifications.unread, '1'));
      return result[0]?.count || 0;
    }
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(id: number) {
  try {
    await db.update(schema.notifications)
      .set({ unread: '0' })
      .where(eq(schema.notifications.id, id));
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllNotificationsAsRead(userId?: number) {
  try {
    if (userId !== undefined) {
      await db.update(schema.notifications)
        .set({ unread: '0' })
        .where(
          and(
            eq(schema.notifications.unread, '1'),
            or(eq(schema.notifications.userId, userId), isNull(schema.notifications.userId))
          )
        );
    } else {
      await db.update(schema.notifications)
        .set({ unread: '0' })
        .where(eq(schema.notifications.unread, '1'));
    }
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * 添加通知
 */
export async function addNotification(notification: typeof schema.notifications.$inferInsert) {
  try {
    const result = await db.insert(schema.notifications).values(notification);
    return result;
  } catch (error) {
    console.error('Error adding notification:', error);
    return null;
  }
}