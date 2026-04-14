import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { wordId, assignedDate } = await request.json();

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 現在のassign_countを取得
    const { data: word, error: fetchError } = await supabase
      .from('vb_words')
      .select('id, assign_count')
      .eq('id', wordId)
      .single();

    if (fetchError || !word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    const currentCount = word.assign_count || 1;

    // assign_count +1, assigned_date更新
    const { error } = await supabase
      .from('vb_words')
      .update({
        assign_count: currentCount + 1,
        assigned_date: assignedDate || (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })(),
      })
      .eq('id', wordId);

    if (error) throw error;

    return NextResponse.json({ success: true, assign_count: currentCount + 1 });
  } catch (error) {
    console.error('Reassign error:', error);
    return NextResponse.json({ error: 'Failed to reassign word' }, { status: 500 });
  }
}
