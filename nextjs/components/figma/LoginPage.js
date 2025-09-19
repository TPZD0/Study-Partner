import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      // Redirect to FastAPI Google OAuth login endpoint (Next.js rewrites /api/* to FastAPI)
      window.location.href = '/api/auth/google/login';
    } catch (e) {
      setError('Unable to start Google login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-primary mb-2">Study Partner</h1>
          <p className="text-muted-foreground">Sign in with your Google account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Button onClick={handleGoogleLogin} className="w-full" disabled={loading}>
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </Button>
      </Card>
    </div>
  );
}
