import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Resume Screening System API',
        version: '1.0.0',
        description: 'API documentation for the Resume Screening System. This system manages resume parsing, candidate screening, interview scheduling, and automated notifications.',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'User authentication and session management',
        },
        {
          name: 'Resumes',
          description: 'Candidate resume management, including upload, status updates, and comments',
        },
        {
          name: 'Interviews',
          description: 'Interview scheduling and management',
        },
        {
          name: 'Notifications',
          description: 'User notifications and alerts',
        },
        {
          name: 'System',
          description: 'System-wide configurations and reference data',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              email: { type: 'string', format: 'email', example: 'admin@mahui.com' },
              name: { type: 'string', example: 'Admin User' },
              role: { 
                type: 'string', 
                enum: ['admin', 'member', 'teacher', 'hr'],
                example: 'admin' 
              },
              avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
              department: { type: 'string', example: '办公室' },
            },
          },
          Student: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'stu_123' },
              name: { type: 'string', example: '张三' },
              studentId: { type: 'string', example: '2021001' },
              department: { type: 'string', example: '计算机学院' },
              major: { type: 'string', example: '软件工程' },
              class: { type: 'string', example: '2101班' },
              gpa: { type: 'string', example: '3.8/4.0' },
              graduationYear: { type: 'string', example: '2025' },
              status: { 
                type: 'string', 
                enum: ['pending', 'to_be_scheduled', 'pending_interview', 'interviewing', 'passed', 'rejected'],
                example: 'pending' 
              },
              aiScore: { type: 'number', example: 85 },
              tags: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['Java', 'React', '竞赛获奖'] 
              },
              submissionDate: { type: 'string', format: 'date-time' },
            },
          },
          Interview: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'int_123' },
              name: { type: 'string', description: 'Candidate Name', example: '张三' },
              interviewers: { 
                type: 'array', 
                items: { type: 'string' },
                example: ['李面试官', '王面试官'] 
              },
              time: { type: 'string', example: '14:00' },
              date: { type: 'string', format: 'date', example: '2023-10-20' },
              location: { type: 'string', example: '会议室A' },
              priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high'],
                example: 'high' 
              },
              stage: { 
                type: 'string', 
                enum: ['pending', 'to_be_scheduled', 'pending_interview', 'interviewing', 'passed', 'rejected'],
                example: 'interviewing' 
              },
            },
          },
          Notification: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'notif_1' },
              type: { 
                type: 'string', 
                enum: ['interview', 'resume', 'system'],
                example: 'interview' 
              },
              title: { type: 'string', example: '面试提醒' },
              description: { type: 'string', example: '您有一场即将开始的面试' },
              time: { type: 'string', example: '10分钟前' },
              unread: { type: 'boolean', example: true },
            },
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'An error occurred' },
              code: { type: 'string', example: 'ERR_INVALID_INPUT' },
            },
          },
          SuccessResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
            },
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
