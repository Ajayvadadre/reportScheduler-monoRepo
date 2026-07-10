import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router';

type AuthMode = 'login' | 'signup' | 'forgot';

const Login: React.FC = () => {
  const { loginUser, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(localStorage.getItem('rememberedEmail')));
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const getErrorMessage = (err: any, defaultMessage: string) => {
    return err.response?.data?.message || defaultMessage;
  };

  const handleAuthSubmit = async () => {
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
    const payload = { email, user: email, password, rememberMe };
    const response = await api.post(endpoint, payload);

    if (response.data.status === 'successful') {
      loginUser({ email }, rememberMe);
      navigate('/dashboard');
      return;
    }

    setError(response.data.message || 'Something went wrong');
  };

  const handleForgotSubmit = async () => {
    try {
      await api.post('/auth/forgot-password', { email, user: email });
      setMessage('If this email exists, a reset link will be sent.');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMessage('Forgot password screen is ready, but backend reset API is not added yet.');
        return;
      }

      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'forgot') {
        await handleForgotSubmit();
      } else {
        await handleAuthSubmit();
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Unable to complete request'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0 w-full sm:max-w-md">
        <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
          Chronos
        </div>

        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              {mode === 'signup' && 'Create your account'}
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h1>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg" role="status">
                {message}
              </div>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="name@company.com"
                  required
                />
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    required
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                    />
                    <label htmlFor="remember" className="ml-3 text-sm text-gray-500 dark:text-gray-300 select-none cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeMode('forgot')}
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && 'Processing...'}
                {!loading && mode === 'login' && 'Sign in'}
                {!loading && mode === 'signup' && 'Sign up'}
                {!loading && mode === 'forgot' && 'Send reset link'}
              </button>

              {mode === 'login' && (
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Don&apos;t have an account yet?{' '}
                  <button type="button" onClick={() => changeMode('signup')} className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                    Sign up
                  </button>
                </p>
              )}

              {mode === 'signup' && (
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => changeMode('login')} className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Remember your password?{' '}
                  <button type="button" onClick={() => changeMode('login')} className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                    Back to login
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
