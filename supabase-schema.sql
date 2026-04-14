-- VocabularyBase Database Schema (PrintBase共存版)
-- テーブル名に vb_ プレフィックスを付けて競合を回避

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 生徒テーブル
CREATE TABLE vb_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade TEXT,
  token TEXT UNIQUE NOT NULL,
  avatar_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 単語テーブル
CREATE TABLE vb_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES vb_students(id) ON DELETE CASCADE NOT NULL,
  english TEXT NOT NULL,
  meanings JSONB NOT NULL DEFAULT '[]',
  example_sentence TEXT,
  example_sentence_ja TEXT,
  source TEXT,
  word_audio_url TEXT,
  sentence_audio_url TEXT,
  assigned_date DATE,         -- 講師が配信した日付（宿題の日付）
  assigned_by TEXT,            -- 'teacher' or 'student'（誰が登録したか）
  assign_count INT DEFAULT 1,  -- 出題回数（同じ単語を再度配信するとインクリメント）
  difficulty INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  last_tested TIMESTAMPTZ,
  first_tested TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- テスト結果テーブル
CREATE TABLE vb_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES vb_students(id) ON DELETE CASCADE NOT NULL,
  word_id UUID REFERENCES vb_words(id) ON DELETE CASCADE NOT NULL,
  quiz_type TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  tested_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_vb_words_student_id ON vb_words(student_id);
CREATE INDEX idx_vb_words_english ON vb_words(english);
CREATE INDEX idx_vb_quiz_results_student_id ON vb_quiz_results(student_id);
CREATE INDEX idx_vb_quiz_results_word_id ON vb_quiz_results(word_id);
CREATE INDEX idx_vb_students_token ON vb_students(token);

-- RLS
ALTER TABLE vb_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vb_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE vb_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vb_students_select" ON vb_students FOR SELECT USING (true);
CREATE POLICY "vb_students_all" ON vb_students FOR ALL USING (true);
CREATE POLICY "vb_words_select" ON vb_words FOR SELECT USING (true);
CREATE POLICY "vb_words_all" ON vb_words FOR ALL USING (true);
CREATE POLICY "vb_quiz_results_select" ON vb_quiz_results FOR SELECT USING (true);
CREATE POLICY "vb_quiz_results_all" ON vb_quiz_results FOR ALL USING (true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION vb_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vb_students_updated_at
  BEFORE UPDATE ON vb_students
  FOR EACH ROW EXECUTE FUNCTION vb_update_updated_at();

CREATE TRIGGER vb_words_updated_at
  BEFORE UPDATE ON vb_words
  FOR EACH ROW EXECUTE FUNCTION vb_update_updated_at();
