import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Success! Check your email to confirm your account.');
        setEmail('');
        setPassword('');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-sage';

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12 pt-[100px] sm:px-8">
      <div className="w-full max-w-md rounded-3xl border border-cream-dark bg-cream p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-ink">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isLogin 
              ? 'Log in to view your orders and check out faster.' 
              : 'Join us for a faster checkout experience and order history.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              className={inputClass}
              placeholder="Email address *"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              className={inputClass}
              placeholder="Password *"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-xs text-burgundy">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="rounded-xl bg-sage/10 px-4 py-3 text-xs text-sage">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full cursor-pointer rounded-full bg-burgundy py-3.5 text-sm font-medium tracking-wide text-cream transition-colors hover:bg-burgundy/90 disabled:opacity-60"
          >
            {loading ? 'Processing…' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="font-medium text-ink underline transition-colors hover:text-burgundy cursor-pointer"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
