import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import { fromBuffer } from 'pdf2pic';

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  major?: string;
  className?: string;
  gpa?: string;
  graduationYear?: string;
  tags?: string[];
  aiScore?: string;
  summary?: string;
  experiences?: any[];
  skills?: { name: string; level: 'understanding' | 'familiar' | 'proficient' | 'skilled' | 'master' }[];
};

const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;

const dashscopeBaseUrl =
  process.env.DASHSCOPE_BASE_URL ||
  'https://dashscope.aliyuncs.com/compatible-mode/v1';

const dashscopeModel = process.env.DASHSCOPE_MODEL || 'qwen-plus';

let openaiClient: OpenAI | null = null;

function getClient() {
  if (!dashscopeApiKey) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: dashscopeApiKey,
      baseURL: dashscopeBaseUrl,
    });
  }
  return openaiClient;
}

async function extractPdfText(buffer: Buffer) {
  const result = await pdfParse(buffer);
  return result.text || '';
}

async function convertPdfFirstPageToImage(buffer: Buffer) {
  const convert = fromBuffer(buffer, {
    density: 150,
    format: 'png',
  });

  const page = 1;
  const result = await convert(page, { responseType: 'base64' });

  if (!result || !(result as any).base64) {
    return null;
  }

  const imageBuffer = Buffer.from((result as any).base64, 'base64');

  return {
    buffer: imageBuffer,
    mimeType: 'image/png',
  };
}

async function callDashscopeWithText(text: string): Promise<ParsedResume | null> {
  const client = getClient();
  if (!client) {
    return null;
  }

  const prompt =
    '你是一个HR助手，请从以下简历内容中提取候选人信息，' +
    '并严格返回JSON格式，键包括：name, email, phone, department, major, className, gpa, graduationYear, ' +
    'aiScore, tags, experiences, skills, summary。tags 为字符串数组，experiences 为数组，可以为空；' +
    'summary 为个人总结/评价字符串；' +
    'skills 为数组，每个元素为 { "name": 技能名称, "level": "understanding"|"familiar"|"proficient"|"skilled"|"master" }。' +
    '在识别 skills 时，请对“专业技能”“技能专长”“掌握技能”“具备技能”等板块进行语义层面的模糊匹配，' +
    '即使标题或字段名不同也要归纳到 skills 中；如未明确标注熟练度，请根据表述合理推断 level。' +
    '不要输出任何解释文字，只返回JSON。简历内容：\n' +
    text;

  const response = await client.responses.create({
    model: dashscopeModel,
    input: prompt,
    enable_thinking: true,
  } as any);

  const chunks: string[] = [];
  for (const item of (response as any).output || []) {
    if (item.type === 'message' && item.content && item.content[0]?.text) {
      chunks.push(item.content[0].text);
    }
  }

  const fullText = chunks.join('\n').trim();

  try {
    const match = fullText.match(/\{[\s\S]*\}/);
    const jsonText = match ? match[0] : fullText;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch {
    return null;
  }
}

async function callDashscopeWithImage(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedResume | null> {
  const client = getClient();
  if (!client) {
    return null;
  }

  const base64 = buffer.toString('base64');
  const prompt =
    '你是一个HR助手，请从这张简历照片中识别候选人信息，' +
    '并严格返回JSON格式，键包括：name, email, phone, department, major, className, gpa, graduationYear, ' +
    'aiScore, tags, experiences, skills, summary。tags 为字符串数组，experiences 为数组，可以为空；' +
    'summary 为个人总结/评价字符串；' +
    'skills 为数组，每个元素为 { "name": 技能名称, "level": "understanding"|"familiar"|"proficient"|"skilled"|"master" }。' +
    '在识别 skills 时，请对“专业技能”“技能专长”“掌握技能”“具备技能”等板块进行语义层面的模糊匹配，' +
    '即使标题或字段名不同也要归纳到 skills 中；如未明确标注熟练度，请根据表述合理推断 level。' +
    '不要输出任何解释文字，只返回JSON。';

  const response = await client.responses.create({
    model: dashscopeModel,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
          {
            type: 'input_image',
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
        ],
      },
    ],
    enable_thinking: true,
  } as any);

  const chunks: string[] = [];
  for (const item of (response as any).output || []) {
    if (item.type === 'message' && item.content && item.content[0]?.text) {
      chunks.push(item.content[0].text);
    }
  }

  const fullText = chunks.join('\n').trim();

  try {
    const match = fullText.match(/\{[\s\S]*\}/);
    const jsonText = match ? match[0] : fullText;
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch {
    return null;
  }
}

export async function analyzeResumeFromBuffer(
  buffer: Buffer,
  options: { mimeType: string; fileName?: string }
): Promise<ParsedResume | null> {
  if (!dashscopeApiKey) {
    return null;
  }

  const lowerName = (options.fileName || '').toLowerCase();

  if (options.mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const image = await convertPdfFirstPageToImage(buffer);
      if (image) {
        const result = await callDashscopeWithImage(image.buffer, image.mimeType);
        if (result) {
          return result;
        }
      }
    } catch {
    }

    const text = await extractPdfText(buffer);
    if (!text.trim()) {
      return null;
    }
    return callDashscopeWithText(text.slice(0, 16000));
  }

  if (options.mimeType.startsWith('image/')) {
    return callDashscopeWithImage(buffer, options.mimeType);
  }

  return null;
}
