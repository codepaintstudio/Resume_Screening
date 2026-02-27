  # Resume Screening System

## 项目简介

简历筛选小助手—高效分析简历，是一个现代化的简历管理和筛选系统，旨在帮助企业和招聘人员更高效地管理和筛选简历，提高招聘效率。

## 技术栈

- **前端**：React 19, Next.js 16, TypeScript, Tailwind CSS, Lucide React
- **后端**：Next.js API Routes, Node.js
- **数据库**：SQLite (通过 Drizzle ORM)
- **认证**：JWT
- **其他**：Socket.io (实时通知), Swagger (API 文档), Sonner (通知系统)

## 项目结构

```
├── src/
│   ├── app/            # Next.js 13+ App Router
│   │   ├── api/        # API 路由
│   │   ├── components/ # 组件
│   │   ├── dashboard/  # 仪表盘页面
│   │   ├── emails/     # 邮件系统页面
│   │   ├── interviews/ # 面试管理页面
│   │   ├── resumes/    # 简历库页面
│   │   └── settings/   # 设置页面
│   ├── lib/            # 工具库
│   │   ├── db/         # 数据库相关
│   │   ├── auth.ts     # 认证相关
│   │   └── utils.ts    # 工具函数
│   └── store/          # 状态管理
├── public/             # 静态资源
├── docs/               # 文档
└── scripts/            # 脚本
```

## 安装和运行

### 前提条件

- Node.js 18.0 或更高版本
- pnpm 包管理器

### 安装步骤

1. 克隆项目

```bash
git clone <repository-url>
cd Resume_Screening
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. 初始化数据库

```bash
pnpm run db:push
```

5. 启动开发服务器

```bash
pnpm run dev
```

项目将在 `http://localhost:3000` 运行。

### 构建生产版本

```bash
pnpm run build
pnpm run start
```

## 主要功能

### 1. 简历管理
- 上传和管理简历
- 简历分类和标签
- 简历搜索和筛选
- 简历批量处理

### 2. AI 筛选
- 基于关键词和技能的智能筛选
- 简历评分和排序
- 自动提取关键信息

### 3. 面试管理
- 面试看板（Kanban）
- 面试安排和调度
- 面试反馈和评价

### 4. 邮件系统
- 邮件模板管理
- 批量邮件发送
- 邮件历史记录

### 5. 仪表盘
- 招聘数据统计
- 部门分布图表
- 提交趋势分析
- 最近活动和即将到来的面试

### 6. GitHub 集成
- GitHub 组织成员管理
- 邀请团队成员

### 7. 系统设置
- 用户管理
- 部门管理
- API 密钥管理
- 邮件配置
- AI 模型设置

## API 文档

项目提供了完整的 API 文档，可通过以下方式访问：

- 开发环境：`http://localhost:3000/api-doc`
- 生产环境：`https://your-domain.com/api-doc`

API 文档基于 OpenAPI 规范，使用 Swagger UI 展示。

## 环境变量

项目需要以下环境变量：

```env
# 数据库连接字符串
DATABASE_URL="file:./db.sqlite"

# JWT 密钥
JWT_SECRET="your-secret-key"

# GitHub 集成（可选）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 邮件配置（可选）
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-email-password"

# AI 配置（可选）
AI_API_KEY="your-ai-api-key"
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎贡献代码和提出问题！请先查看 [CONTRIBUTING.md](CONTRIBUTING.md) 文件（如果存在）。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：your-email@example.com
- GitHub Issues：https://github.com/your-username/resume-screening-system/issues
