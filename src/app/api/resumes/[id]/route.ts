import { NextResponse } from 'next/server';
import { addActivity } from '@/data/activity-log';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data generation based on ID to be consistent
  const studentIdNum = parseInt(id) || 123;
  
  const detailedStudent = {
    id: id,
    name: ['张子涵', '李思源', '王梦洁', '赵天宇'][studentIdNum % 4] || '张三',
    studentId: `2021${(studentIdNum % 100).toString().padStart(3, '0')}`,
    department: ['前端部', 'UI部', '办公室', '运维'][studentIdNum % 4],
    major: ['软件工程', '视觉传达', '行政管理', '信息安全'][studentIdNum % 4],
    class: `210${(studentIdNum % 3) + 1}班`,
    gpa: (3.0 + (studentIdNum % 10) / 10).toFixed(1),
    graduationYear: '2025',
    status: 'pending', // Default, will be overridden by frontend state usually
    tags: [['React', 'Three.js'], ['Figma', 'C4D'], ['文案策划'], ['Docker', 'K8s']][studentIdNum % 4],
    aiScore: 80 + (studentIdNum % 15),
    submissionDate: '2024-03-15',
    email: `student${id}@example.com`,
    phone: `138${id.toString().padStart(8, '0')}`,
    skills: [
      { name: 'React', level: 'master' },
      { name: 'TypeScript', level: 'skilled' },
      { name: 'Node.js', level: 'proficient' },
    ],
    experiences: [
      {
        id: '1',
        startDate: '2023.09',
        endDate: '2024.01',
        title: '实验室官网开发项目',
        description: '独立使用 Next.js 完成了官网的前端构建，集成了暗色模式与响应式设计。负责前端架构设计，使用 Tailwind CSS 进行样式开发。'
      },
      {
        id: '2',
        startDate: '2023.03',
        endDate: '2023.08',
        title: '校园二手交易平台',
        description: '作为核心成员参与开发，负责商品列表页和详情页的实现。优化了图片加载速度，提升了用户体验。'
      }
    ],
    summary: '热爱编程，对前端技术有浓厚兴趣。具备良好的自学能力和团队协作精神。希望能在贵实验室提升自己的技术水平。'
  };

  return NextResponse.json(detailedStudent);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const body = await request.json();
  const { status, user } = body; // Expect user info in body

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Log activity if status changed
  if (status) {
    // Mapping status to readable text
    const statusMap: Record<string, string> = {
      'pending': '待筛选',
      'pending_interview': '待面试',
      'interviewing': '面试中',
      'passed': '面试通过',
      'rejected': '未通过'
    };

    addActivity({
      user: user?.name || 'Admin',
      action: `更新候选人状态为 [${statusMap[status] || status}]`,
      role: user?.role || '管理员',
      avatar: user?.avatar || ''
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Updated successfully',
    data: {
      id,
      ...body
    }
  });
}
