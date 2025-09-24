
import { NextResponse } from 'next/server';
import { rescanRootPath } from '@/lib/scanner';
import { getAllPaths } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { rootPath } = await request.json();
    if (!rootPath) {
      return NextResponse.json({ message: 'rootPath is required' }, { status: 400 });
    }

    await rescanRootPath(rootPath);
    // Immediately fetch all updated paths
    const allPaths = await getAllPaths();

    return NextResponse.json({ message: 'Scan complete', paths: allPaths }, { status: 200 });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
