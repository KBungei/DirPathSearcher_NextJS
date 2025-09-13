import { NextResponse } from 'next/server';
import { addNewRootPath } from '@/lib/scanner';

export async function POST(request: Request) {
  try {
    const { rootPath } = await request.json();
    if (!rootPath) {
      return NextResponse.json({ message: 'rootPath is required' }, { status: 400 });
    }

    // Do not await this, let it run in the background
    addNewRootPath(rootPath);

    return NextResponse.json({ message: 'Scan started' }, { status: 202 });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}