import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json({ error: 'ADMIN_PASSWORDが環境変数に設定されていません。' }, { status: 500 });
    }
    
    if (password === adminPassword) {
      // シンプルなトークン生成（本番ではJWTなどを使用するのが望ましい）
      const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({ success: true });
      
      // httpOnly cookieにセッションを保存
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24時間
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: '認証に失敗しました。' }, { status: 500 });
  }
}
