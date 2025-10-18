import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldCheckIcon, UserCircleIcon, UsersIcon, ArrowLeftIcon } from './icons/Icons';

type Mode = 'portal' | 'admin' | 'employee' | 'tech';

const LoginOptionButton: React.FC<{onClick: () => void, icon: React.ReactNode, title: string}> = ({ onClick, icon, title}) => (
    <button
        onClick={onClick}
        className="w-full px-4 py-3 font-semibold text-left text-gray-800 transition-colors duration-200 bg-gray-100 rounded-md dark:bg-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600"
    >
        <div className="flex items-center">
            {icon}
            <span className="ml-3 font-bold">{title}</span>
        </div>
    </button>
);

const PortalView: React.FC<{ setMode: (mode: Mode) => void }> = ({ setMode }) => (
    <>
      <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Internal Help Desk</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please select your login type</p>
      </div>
      <div className="space-y-4">
          <LoginOptionButton onClick={() => setMode('admin')} icon={<ShieldCheckIcon className="w-6 h-6"/>} title="Admin Login" />
          <LoginOptionButton onClick={() => setMode('employee')} icon={<UserCircleIcon className="w-6 h-6"/>} title="Employee Login" />
          <LoginOptionButton onClick={() => setMode('tech')} icon={<UsersIcon className="w-6 h-6"/>} title="Support Team Login" />
      </div>
    </>
);

const LoginForm: React.FC<{ 
    title: string;
    username: string;
    setUsername: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    error: string;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}> = ({ title, username, setUsername, password, setPassword, error, onSubmit, onBack }) => (
    <form onSubmit={onSubmit} className="space-y-6">
        <button type="button" onClick={onBack} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to portal
        </button>
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your credentials to proceed</p>
        </div>
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}
        <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
        <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Login
            </button>
        </div>
    </form>
);

const Login: React.FC = () => {
  const { login } = useAppContext();
  const [mode, setMode] = useState<Mode>('portal');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent, role: UserRole) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    const result = login(username, password, role);
    if (!result.success) {
      setError(result.message || 'An unknown error occurred.');
    }
  };
  
  const resetForm = () => {
      setUsername('');
      setPassword('');
      setError('');
      setMode('portal');
  };

  const renderContent = () => {
    switch (mode) {
      case 'admin':
        return <LoginForm title="Admin Login" username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onSubmit={(e) => handleLogin(e, UserRole.ADMIN)} onBack={resetForm} />;
      case 'employee':
        return <LoginForm title="Employee Login" username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onSubmit={(e) => handleLogin(e, UserRole.EMPLOYEE)} onBack={resetForm} />;
      case 'tech':
        return <LoginForm title="Support Team Login" username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onSubmit={(e) => handleLogin(e, UserRole.TECH)} onBack={resetForm} />;
      case 'portal':
      default:
        return <PortalView setMode={setMode} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;