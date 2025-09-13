
import { NextResponse } from 'next/server';
import { search } from '@/lib/search';

export async function POST(request: Request) {
  try {
    const { searchPhrase, orderEnforced, exclusionOrderEnforced } = await request.json();
    if (!searchPhrase) {
      return NextResponse.json({ message: 'searchPhrase is required' }, { status: 400 });
    }

    const results = await search(searchPhrase, orderEnforced, exclusionOrderEnforced);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
