import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import crypto from 'crypto';

// GET: 全生徒の一覧を取得（統計情報付き）
export async function GET(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const { data: students, error: studentsError } = await supabase
      .from('vb_students')
      .select('*')
      .order('created_at', { ascending: true });

    if (studentsError) throw studentsError;

    const studentsWithStats = await Promise.all(
      (students || []).map(async (student) => {
        const { count: wordCount } = await supabase
          .from('vb_words')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id);

        const { data: quizData } = await supabase
          .from('vb_quiz_results')
          .select('is_correct')
          .eq('student_id', student.id);

        const totalQuiz = quizData?.length || 0;
        const correctQuiz = quizData?.filter(q => q.is_correct).length || 0;
        const accuracy = totalQuiz > 0 ? Math.round((correctQuiz / totalQuiz) * 100) : null;

        return {
          ...student,
          word_count: wordCount || 0,
          quiz_total: totalQuiz,
          quiz_correct: correctQuiz,
          accuracy,
        };
      })
    );

    return NextResponse.json({ students: studentsWithStats });
  } catch (error) {
    console.error('Students fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST: 新しい生徒を追加
export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, grade } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const token = crypto.randomBytes(8).toString('hex');
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('vb_students')
      .insert({ name, grade, token, avatar_color: avatarColor })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ student: data });
  } catch (error) {
    console.error('Student create error:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

// DELETE: 生徒を削除
export async function DELETE(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('vb_students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Student delete error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
