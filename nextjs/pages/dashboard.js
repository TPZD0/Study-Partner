import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Dashboard as DashboardView } from '@/components/figma/Dashboard';
import { initialGoals } from '@/lib/sampleData';
import Link from 'next/link';
import { Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    try {
      const name = localStorage.getItem('username');
      if (name) setUsername(name);
    } catch {}
  }, []);

  const updateGoal = (id, updates) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const setCurrentPage = (page) => {
    const map = {
      dashboard: '/dashboard',
      goals: '/goals',
      flashcards: '/flashcards',
      summarizer: '/summarizer',
      settings: '/settings',
    };
    router.push(map[page] || '/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-end gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span className="font-medium">{username}</span>
          </div>
          <Link href="/settings" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-accent text-sm">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <button
            onClick={() => {
              try { localStorage.removeItem('username'); localStorage.removeItem('userEmail'); } catch {}
              router.push('/login');
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-accent text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
        <DashboardView goals={goals} updateGoal={updateGoal} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
