import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Goals as GoalsView } from '@/components/figma/Goals';
import { initialGoals } from '@/lib/sampleData';

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);

  const addGoal = (goal) => {
    setGoals((prev) => [
      ...prev,
      { ...goal, id: (prev.length + 1).toString() },
    ]);
  };

  const updateGoal = (id, updates) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const setCurrentPage = (page) => {
    const map = {
      dashboard: '/dashboard',
    };
    router.push(map[page] || '/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <GoalsView
          goals={goals}
          addGoal={addGoal}
          updateGoal={updateGoal}
          deleteGoal={deleteGoal}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
