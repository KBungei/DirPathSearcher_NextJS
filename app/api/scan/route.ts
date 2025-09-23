import { NextResponse } from 'next/server';
import { rescanRootPath } from '@/lib/scanner';

export async function POST(request: Request) {
  try {
    const { rootPath } = await request.json();
    if (!rootPath) {
      return NextResponse.json({ message: 'rootPath is required' }, { status: 400 });
    }

    await rescanRootPath(rootPath);

    return NextResponse.json({ message: 'Scan complete' }, { status: 200 });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
