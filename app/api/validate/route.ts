import { NextResponse } from 'next/server';
import { validateAndRefreshAllRootPaths } from '@/lib/scanner';

export async function POST(request: Request) {
  try {
    await validateAndRefreshAllRootPaths();
    return NextResponse.json({ message: 'Validation and refresh complete' }, { status: 200 });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
