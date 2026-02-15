# API 接口文档

## 概述
本项目使用 Next.js App Router API Routes 提供后端服务。

## 基础 URL
- 本地: `http://localhost:3000`
- 生产: `https://your-domain.com`

## 认证
除公开接口外，所有 API 请求需要在请求头中携带 JWT Token：
```
Authorization: Bearer <your_token>
```

## 接口列表

### 1. 认证 (Authentication)

| Method | Endpoint | 描述 |
|--------|----------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| GET | `/api/auth/github` | GitHub OAuth 登录 |
| GET | `/api/auth/github/callback` | GitHub OAuth 回调 |
| POST | `/api/auth/change-password` | 修改密码 |

### 2. 简历管理 (Resumes)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/resumes` | 获取简历列表（支持筛选、排序、分页） |
| POST | `/api/resumes` | 上传/创建简历 |
| GET | `/api/resumes/:id` | 获取简历详情 |
| PUT | `/api/resumes/:id` | 更新简历信息 |
| DELETE | `/api/resumes/:id` | 删除简历 |
| GET | `/api/resumes/:id/pdf` | 获取简历 PDF |
| GET | `/api/resumes/:id/download` | 下载简历文件 |
| POST | `/api/resumes/:id/comments` | 添加简历评论 |
| POST | `/api/resumes/batch-screen` | 批量筛选简历 |

### 3. 面试管理 (Interviews)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/interviews/schedule` | 获取面试日程列表 |
| GET | `/api/interviews/upcoming` | 获取即将进行的面试 |

### 4. 通知 (Notifications)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/notifications` | 获取用户通知列表 |

### 5. 仪表盘 (Dashboard)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/dashboard/stats` | 获取统计数据 |
| GET | `/api/dashboard/activities` | 获取活动日志 |
| GET | `/api/dashboard/distribution` | 获取数据分布 |
| GET | `/api/dashboard/trend` | 获取趋势数据 |

### 6. 面试官管理 (Interviewers)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/interviewers` | 获取面试官列表 |

### 7. 部门管理 (Departments)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/departments` | 获取部门列表 |

### 8. 邮件系统 (Emails)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/emails/templates` | 获取邮件模板列表 |
| GET | `/api/emails/templates/:id` | 获取邮件模板详情 |
| PUT | `/api/emails/templates/:id` | 更新邮件模板 |
| POST | `/api/emails/send` | 发送邮件 |
| GET | `/api/emails/history` | 获取发送历史 |
| GET | `/api/emails/history/:id` | 获取历史邮件详情 |

### 9. GitHub 集成

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/github/members` | 获取 GitHub 成员列表 |
| POST | `/api/github/invite` | 邀请成员加入 GitHub 组织 |

### 10. 系统设置 (Settings)

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/settings/profile` | 获取用户配置 |
| PUT | `/api/settings/profile` | 更新用户配置 |
| GET | `/api/settings/platform` | 获取平台配置 |
| PUT | `/api/settings/platform` | 更新平台配置 |
| GET | `/api/settings/keys` | 获取 API 密钥列表 |
| POST | `/api/settings/keys/generate` | 生成新的 API 密钥 |
| GET | `/api/settings/ai` | 获取 AI 配置 |
| PUT | `/api/settings/ai` | 更新 AI 配置 |
| GET | `/api/settings/notifications` | 获取通知设置 |
| PUT | `/api/settings/notifications` | 更新通知设置 |
| POST | `/api/settings/resume-import` | 导入简历 |
| GET | `/api/settings/email-sending` | 获取邮件发送设置 |
| PUT | `/api/settings/email-sending` | 更新邮件发送设置 |
| GET | `/api/settings/github` | 获取 GitHub 设置 |
| PUT | `/api/settings/github` | 更新 GitHub 设置 |

### 11. WebSocket

| Method | Endpoint | 描述 |
|--------|----------|------|
| WS | `/api/ws` | WebSocket 实时通信 |

### 12. OpenAPI 文档

| Method | Endpoint | 描述 |
|--------|----------|------|
| GET | `/api/doc` | 获取 OpenAPI 规范 (JSON) |

## 数据模型 (Schema)

### User (用户)
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'teacher' | 'hr';
  avatar?: string;
  department?: string;
}
```

### Student (候选人/简历)
```typescript
{
  id: string;
  name: string;
  studentId: string;
  department: string;
  major: string;
  class: string;
  gpa: string;
  graduationYear: string;
  status: 'pending' | 'to_be_scheduled' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';
  aiScore?: number;
  tags?: string[];
  submissionDate: string;
}
```

### Interview (面试)
```typescript
{
  id: string;
  name: string;
  interviewers: string[];
  time: string;
  date: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  stage: 'pending' | 'to_be_scheduled' | 'pending_interview' | 'interviewing' | 'passed' | 'rejected';
}
```

### Notification (通知)
```typescript
{
  id: string;
  type: 'interview' | 'resume' | 'system';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}
```

## API 文档 UI
访问 `/api-doc` 可查看交互式 Swagger UI 文档。

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERR_CODE"
}
```
