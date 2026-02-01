# API 接口文档

## 概述
本项目使用 Next.js App Router API Routes 提供后端服务。

## 基础 URL
`/api`

## 接口列表

### 1. 示例接口
- **URL**: `/api/hello`
- **Method**: `GET`
- **描述**: 测试后端服务是否正常运行
- **响应**:
  ```json
  {
    "message": "Hello from Next.js Backend!"
  }
  ```

### 2. 用户 (User) - 待实现
- `GET /api/users`: 获取所有用户
- `POST /api/users`: 创建新用户
- `GET /api/users/:id`: 获取特定用户
- `PUT /api/users/:id`: 更新用户
- `DELETE /api/users/:id`: 删除用户

### 3. 候选人 (Candidate) - 待实现
- `GET /api/candidates`: 获取候选人列表（支持筛选、排序）
- `POST /api/candidates`: 添加候选人
- `PUT /api/candidates/:id`: 更新候选人状态
- `DELETE /api/candidates/:id`: 删除候选人

## 数据模型 (Schema)

### Users
- `id`: Integer, Primary Key
- `name`: String
- `email`: String, Unique
- `role`: String (default: 'user')
- `created_at`: Timestamp

### Candidates
- `id`: Integer, Primary Key
- `name`: String
- `student_id`: String
- `department`: String
- `major`: String
- `class`: String
- `gpa`: String
- `status`: String (pending, interviewing, passed, rejected)
- `ai_score`: Integer
- `tags`: String (JSON/Comma separated)
- `graduation_year`: String
- `created_at`: Timestamp
