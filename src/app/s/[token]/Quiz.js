'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';

// 配列をシャッフルするヘルパー関数
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Quiz({ token, studentId }) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // テストの状態
  const [quizState, setQuizState] = useState('start'); // 'start', 'playing', 'result'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!studentId) return;
    fetchWords();
  }, [studentId]);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('vb_words')
        .select('*')
        .eq('student_id', studentId);
        
      if (error) throw error;
      setWords(data || []);
    } catch (err) {
      console.error('Error fetching words:', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    // 4単語以上登録されていないと4択テストが作れない
    if (words.length < 4) {
      alert('テストを行うには、少なくとも4つ以上の単語を登録してください。');
      return;
    }
    
    // 最大10問を出題
    const shuffledWords = shuffleArray(words);
    const targetWords = shuffledWords.slice(0, Math.min(10, words.length));
    
    // 各問題の選択肢を生成
    const generatedQuestions = targetWords.map(targetWord => {
      // 不正解の選択肢をランダムに3つ選ぶ
      const wrongWords = shuffledWords
        .filter(w => w.id !== targetWord.id)
        .slice(0, 3);
        
      // 問題データの作成（英→日）
      const correctAnswer = targetWord.meanings[0]; // 最初の意味を正解とする
      const wrongAnswers = wrongWords.map(w => w.meanings[0]);
      
      const choices = shuffleArray([correctAnswer, ...wrongAnswers]);
      
      return {
        word: targetWord,
        questionText: targetWord.english,
        choices,
        correctAnswer
      };
    });
    
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizState('playing');
  };

  const handleAnswer = async (choice) => {
    if (isAnswered) return; // 既に回答済みなら無視
    
    setSelectedAnswer(choice);
    setIsAnswered(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = choice === currentQ.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // DBに結果を非同期で保存
    try {
      await supabase.from('vb_quiz_results').insert({
        student_id: studentId,
        word_id: currentQ.word.id,
        quiz_type: 'en_to_ja',
        is_correct: isCorrect
      });
      
      // wordsテーブルの正答数/誤答数も更新するとなお良いが、ここではシンプルに
    } catch (e) {
      console.error('Failed to save quiz result', e);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizState('result');
    }
  };

  if (loading) {
    return <div className="text-muted">読み込み中...</div>;
  }

  if (quizState === 'start') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 className="title-2">確認テスト</h2>
        <p className="text-muted mb-4" style={{ marginBottom: '2rem' }}>
          登録した単語からランダムに4択問題を出題します。<br/>
          現在の登録単語数: {words.length}語
        </p>
        <button 
          className="btn btn-primary" 
          onClick={startQuiz}
          style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
          disabled={words.length < 4}
        >
          テストをはじめる
        </button>
        {words.length < 4 && (
          <p className="text-muted mt-4" style={{ color: 'var(--danger)' }}>
            ※4択テストを作成するため、最低4つの単語を登録してください。
          </p>
        )}
      </div>
    );
  }

  if (quizState === 'result') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h2 className="title-1">テスト結果</h2>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', margin: '1rem 0' }}>
          {score} / {questions.length}
        </div>
        <p className="text-muted mb-4" style={{ marginBottom: '2rem' }}>
          お疲れ様でした！間違えた単語は一覧画面で復習しましょう。
        </p>
        <button className="btn btn-secondary" onClick={() => setQuizState('start')}>
          もう一度テストする
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center text-muted mb-4">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>
      
      <div style={{ textAlign: 'center', margin: '2rem 0 3rem 0' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{currentQ.questionText}</h2>
      </div>
      
      <div className="flex-col gap-4">
        {currentQ.choices.map((choice, i) => {
          let btnClass = 'btn-secondary';
          if (isAnswered) {
            if (choice === currentQ.correctAnswer) {
              btnClass = 'btn-primary'; // 正解は緑色などにするとなお良い
            } else if (choice === selectedAnswer) {
              btnClass = 'btn-outline'; // 間違えて選んだもの
            }
          }
          
          return (
            <button 
              key={i}
              className={`btn ${btnClass}`}
              style={{ 
                padding: '1rem', 
                fontSize: '1.1rem', 
                width: '100%', 
                justifyContent: 'flex-start',
                textAlign: 'left',
                border: isAnswered && choice === currentQ.correctAnswer ? '2px solid var(--secondary)' : '',
                backgroundColor: isAnswered && choice === currentQ.correctAnswer ? 'var(--secondary-light)' : ''
              }}
              onClick={() => handleAnswer(choice)}
              disabled={isAnswered}
            >
              {['A', 'B', 'C', 'D'][i]}. {choice}
            </button>
          );
        })}
      </div>
      
      {isAnswered && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={nextQuestion} style={{ width: '100%', padding: '1rem' }}>
            {currentIndex + 1 === questions.length ? '結果を見る' : '次の問題へ →'}
          </button>
        </div>
      )}
    </div>
  );
}
