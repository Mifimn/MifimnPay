import { NextResponse } from 'next/server';

type Data = {
  name: string
}

/**
 * app/api/hello/route.ts
 * Route Handler for GET requests.
 */
export async function GET() {
  const data: Data = { name: 'John Doe' };

  return NextResponse.json(data, { status: 200 });
}