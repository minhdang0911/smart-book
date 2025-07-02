import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
  }

  // Redirect đến trang client-side để xử lý lưu token
  return NextResponse.redirect(`http://localhost:3000/google-landing?access_token=${accessToken}`, 302);
}
