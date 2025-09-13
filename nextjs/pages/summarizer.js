import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Summarizer as SummarizerView } from '@/components/figma/Summarizer';

export default function SummarizerPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);

  const setCurrentPage = (page) => {
    const map = {
      dashboard: '/dashboard',
    };
    router.push(map[page] || '/dashboard');
  };

  const addSummary = (summary) => {
    const id = `sum-${Date.now()}`;
    setHistory((prev) => [{ ...summary, id }, ...prev]);
  };

  const deleteSummary = (id) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
  };

  const renameSummary = (id, newTitle) => {
    setHistory((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <SummarizerView
          summaryHistory={history}
          addSummary={addSummary}
          deleteSummary={deleteSummary}
          renameSummary={renameSummary}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
