import { NextResponse } from 'next/server';
import { createServerClient, fetchAllRows } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

/**
 * サンシャイン教科書の音声URLを修復するAPI
 * DBに保存されたword_audio_url / sentence_audio_urlが
 * 正しいrankに基づいているかをチェックし、修正する
 */
export async function POST(request) {
  const session = request.cookies.get('admin_session');
  if (!session) {
    return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { studentId, dryRun = true } = body;

    const supabase = createServerClient();

    // 対象生徒の全単語を取得（1000行制限回避）
    let query = supabase.from('vb_words').select('*');
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    // sourceに「サンシャイン」を含むもののみ
    query = query.like('source', '%サンシャイン%');

    const { data: words, error } = await fetchAllRows(query);
    if (error) throw error;

    if (!words || words.length === 0) {
      return NextResponse.json({ message: 'サンシャイン単語が見つかりません', fixed: 0 });
    }

    // サンシャインのJSON辞書をロード（英語→rank マッピング）
    const gradeMap = {
      'サンシャイン中1': 'sunshine1',
      'サンシャイン中2': 'sunshine2',
      'サンシャイン中3': 'sunshine3',
    };

    const lookupMaps = {};
    for (const [label, listType] of Object.entries(gradeMap)) {
      try {
        const jsonPath = path.join(process.cwd(), 'public', `wordlist_${listType}.json`);
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const wordList = data.words || data;
        
        // english(小文字)→rank のマップ
        const map = {};
        wordList.forEach(w => {
          const eng = (w.word || w.english || '').toLowerCase();
          if (eng && w.rank) {
            // 同じ英語でもrankが異なる場合がある（section違い）
            // sectionも含めてキーにする
            const key = `${eng}::${w.section || ''}`;
            map[key] = { rank: w.rank, section: w.section, word: w.word || w.english };
          }
        });
        lookupMaps[label] = { map, listType, wordList };
      } catch (e) {
        console.error(`Failed to load ${listType}:`, e);
      }
    }

    const results = [];
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let notFoundCount = 0;

    for (const word of words) {
      const source = word.source || '';
      
      // sourceから学年とセクションを抽出
      // 例: "サンシャイン中1 Program 1" → grade="サンシャイン中1", section="Program 1"
      let grade = null;
      let sectionLabel = null;
      for (const label of Object.keys(gradeMap)) {
        if (source.startsWith(label)) {
          grade = label;
          sectionLabel = source.replace(label, '').trim();
          break;
        }
      }

      if (!grade || !lookupMaps[grade]) {
        notFoundCount++;
        continue;
      }

      const lookup = lookupMaps[grade];
      const listType = lookup.listType;
      const english = (word.english || '').toLowerCase();

      // セクションキーを特定
      let sectionKey = '';
      if (sectionLabel) {
        // "Program 1" → section key "1"
        // "Get Ready" → section key "L0"
        // "Let's Talk 1" → section key "L1"
        const sectionMatch = lookup.wordList.find(w => {
          const eng = (w.word || w.english || '').toLowerCase();
          return eng === english;
        });
        if (sectionMatch) {
          sectionKey = sectionMatch.section || '';
        }
      }

      // 英語+セクションでrank検索
      let found = lookup.map[`${english}::${sectionKey}`];
      
      // セクション指定で見つからない場合は英語のみで検索
      if (!found) {
        for (const [key, val] of Object.entries(lookup.map)) {
          if (key.startsWith(`${english}::`)) {
            found = val;
            break;
          }
        }
      }

      if (!found) {
        notFoundCount++;
        results.push({
          english: word.english,
          source,
          status: 'NOT_FOUND',
          message: 'JSONに該当単語なし',
        });
        continue;
      }

      const correctWordUrl = `/audio/${listType}/${found.rank}_word.mp3`;
      const correctExampleUrl = word.example_sentence 
        ? `/audio/${listType}/${found.rank}_example.mp3`
        : null;

      const currentWordUrl = word.word_audio_url || '';
      const currentExampleUrl = word.sentence_audio_url || '';

      const wordUrlWrong = currentWordUrl !== correctWordUrl;
      const exampleUrlWrong = correctExampleUrl && currentExampleUrl !== correctExampleUrl;

      if (!wordUrlWrong && !exampleUrlWrong) {
        alreadyCorrectCount++;
        continue;
      }

      const updateData = {};
      if (wordUrlWrong) updateData.word_audio_url = correctWordUrl;
      if (exampleUrlWrong) updateData.sentence_audio_url = correctExampleUrl;

      results.push({
        english: word.english,
        source,
        rank: found.rank,
        status: 'FIXED',
        oldWordUrl: currentWordUrl,
        newWordUrl: correctWordUrl,
        oldExampleUrl: currentExampleUrl || '(なし)',
        newExampleUrl: correctExampleUrl || '(なし)',
        wordUrlChanged: wordUrlWrong,
        exampleUrlChanged: exampleUrlWrong,
      });

      if (!dryRun) {
        await supabase
          .from('vb_words')
          .update(updateData)
          .eq('id', word.id);
      }

      fixedCount++;
    }

    return NextResponse.json({
      total: words.length,
      fixed: fixedCount,
      alreadyCorrect: alreadyCorrectCount,
      notFound: notFoundCount,
      dryRun,
      details: results.slice(0, 50), // 詳細は最大50件まで
    });
  } catch (error) {
    console.error('Fix audio error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
