import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 700));

  const data = [
    { name: '前端部', value: Math.floor(Math.random() * 30) + 20, fill: '#2563eb' },
    { name: 'UI部', value: Math.floor(Math.random() * 30) + 10, fill: '#8b5cf6' },
    { name: '办公室', value: Math.floor(Math.random() * 20) + 5, fill: '#ec4899' },
    { name: '运维', value: Math.floor(Math.random() * 20) + 5, fill: '#f97316' },
  ];

  return NextResponse.json(data);
}
