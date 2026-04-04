import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('vb_words')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ words: data || [] });
  } catch (error) {
    console.error('Words fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      student_id, english, meanings, example_sentence,
      example_sentence_ja, source, word_audio_url,
      sentence_audio_url, assigned_date, assigned_by
    } = body;

    if (!student_id || !english || !meanings?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('vb_words')
      .insert({
        student_id,
        english: english.trim(),
        meanings,
        example_sentence: example_sentence || null,
        example_sentence_ja: example_sentence_ja || null,
        source: source || null,
        word_audio_url: word_audio_url || null,
        sentence_audio_url: sentence_audio_url || null,
        assigned_date: assigned_date || null,
        assigned_by: assigned_by || 'student',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ word: data });
  } catch (error) {
    console.error('Word insert error:', error);
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }
}
