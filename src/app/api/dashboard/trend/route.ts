import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 600));

  const data = [
    { name: '01-26', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-27', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-28', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-29', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-30', value: Math.floor(Math.random() * 50) + 10 },
    { name: '01-31', value: Math.floor(Math.random() * 50) + 10 },
    { name: '02-01', value: Math.floor(Math.random() * 50) + 10 },
  ];

  return NextResponse.json(data);
}
