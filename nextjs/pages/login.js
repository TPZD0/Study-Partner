import React from 'react';
import { useRouter } from 'next/router';
import { LoginPage } from '@/components/figma/LoginPage';

export default function Login() {
  const router = useRouter();

  const handleLogin = (email, name) => {
    try {
      if (name) localStorage.setItem('username', name);
      if (email) localStorage.setItem('userEmail', email);
    } catch {}
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoginPage onLogin={handleLogin} />
    </div>
  );
}
