import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const LoginForm = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[var(--dark-bg-color)]">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg dark:bg-[var(--dark-card-color)]">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-[var(--dark-text-color)]">Fuel Logger</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:text-red-300 dark:bg-red-900">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--dark-text-color)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-[var(--dark-input-bg-color)] dark:border-[var(--dark-border-color)] dark:text-[var(--dark-text-color)]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-[var(--dark-hover-color)]"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;