import { useState } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login flow
        const response = await axios.post('/api/users/login', {
          identifier: email,
          password: password
        });

        const userData = response.data;
        
        // Store user data in localStorage
        localStorage.setItem('userId', userData.user_id.toString());
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userEmail', userData.email);
        if (userData.first_name) localStorage.setItem('firstName', userData.first_name);
        if (userData.last_name) localStorage.setItem('lastName', userData.last_name);

        // Call the onLogin callback
        onLogin(userData.email, userData.username);
      } else {
        // Registration flow
        if (!name) {
          setError('Please enter your full name.');
          return;
        }

        const response = await axios.post('/api/users/create', {
          username: email.split('@')[0], // Use email prefix as username
          password: password,
          email: email,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || ''
        });

        const userData = response.data;
        
        // Store user data in localStorage
        localStorage.setItem('userId', userData.user_id.toString());
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userEmail', userData.email);
        if (userData.first_name) localStorage.setItem('firstName', userData.first_name);
        if (userData.last_name) localStorage.setItem('lastName', userData.last_name);

        // Call the onLogin callback
        onLogin(userData.email, userData.username);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response && err.response.status === 400) {
        setError(err.response.data.detail || 'Registration failed. Please check your information.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-primary mb-2">Study Partner</h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </Card>
    </div>
  );
}
