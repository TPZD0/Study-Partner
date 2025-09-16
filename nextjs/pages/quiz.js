import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Quiz as QuizView } from '@/components/figma/Quiz';
import { sampleQuizHistory } from '@/lib/sampleData';

export default function QuizPage() {
  const router = useRouter();
  const [history, setHistory] = useState(sampleQuizHistory);

  // optional: persist across navigation
  useEffect(() => {
    try {
      const raw = localStorage.getItem('quizHistory');
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('quizHistory', JSON.stringify(history)); } catch {}
  }, [history]);

  const setCurrentPage = (page) => {
    const map = {
      dashboard: '/dashboard',
    };
    router.push(map[page] || '/dashboard');
  };

  const addQuizSet = (set) => {
    const id = `gen-${Date.now()}`;
    setHistory((prev) => [{ ...set, id }, ...prev]);
  };
  const deleteQuizSet = (id) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
  };
  const renameQuizSet = (id, newTitle) => {
    setHistory((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };
  const navigateToQuiz = (quizId) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <QuizView
          quizHistory={history}
          addQuizSet={addQuizSet}
          deleteQuizSet={deleteQuizSet}
          renameQuizSet={renameQuizSet}
          setCurrentPage={setCurrentPage}
          navigateToQuiz={navigateToQuiz}
        />
      </div>
    </div>
  );
}
