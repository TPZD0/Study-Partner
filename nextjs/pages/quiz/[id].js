import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { QuizDetail } from '@/components/figma/QuizDetail';
import { sampleFlashcardHistory } from '@/lib/sampleData';

export default function QuizDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const quiz = useMemo(() => {
    if (!id) return undefined;
    return sampleFlashcardHistory.find((q) => q.id === id) || sampleFlashcardHistory[0];
  }, [id]);

  const updateQuizResult = (quizId, result) => {
    console.log('Quiz result', quizId, result);
  };

  const setCurrentPage = (page) => router.push('/flashcards');

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <QuizDetail quiz={quiz} setCurrentPage={setCurrentPage} updateQuizResult={updateQuizResult} />
      </div>
    </div>
  );
}
