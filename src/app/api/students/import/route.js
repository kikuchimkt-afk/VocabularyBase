import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import crypto from 'crypto';

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'データが空です' }, { status: 400 });
    }

    const supabase = createServerClient();
    const results = [];
    let successCount = 0;
    let skipCount = 0;

    for (const row of rows) {
      // name / 名前 のいずれかのカラムを受け付ける
      const name = (row['name'] || row['名前'] || row['Name'] || '').toString().trim();
      const grade = (row['grade'] || row['学年'] || row['Grade'] || '').toString().trim();
      
      if (!name) {
        results.push({ name: '(空行)', status: 'スキップ' });
        skipCount++;
        continue;
      }

      // ランダムトークン生成
      const token = crypto.randomBytes(8).toString('hex');
      // ランダムアバターカラー
      const colors = ['#6366f1', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];
      const avatar_color = colors[Math.floor(Math.random() * colors.length)];

      const { error } = await supabase
        .from('vb_students')
        .insert({ name, grade, token, avatar_color });

      if (error) {
        results.push({ name, status: `エラー: ${error.message}` });
      } else {
        results.push({ name, grade, status: '✅ 登録完了' });
        successCount++;
      }
    }

    return NextResponse.json({ 
      results, 
      summary: { total: rows.length, success: successCount, skip: skipCount, error: rows.length - successCount - skipCount }
    });
  } catch (error) {
    console.error('Excel import error:', error);
    return NextResponse.json({ error: 'ファイルの処理に失敗しました' }, { status: 500 });
  }
}
