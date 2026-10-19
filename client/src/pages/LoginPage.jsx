import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onLogin }) => {
    const auth = useAuth();
    const handleLogin = onLogin || auth?.login;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);
        try {
            await handleLogin(email.trim(), password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Branding Header */}
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-sm tracking-wider shadow-sm mb-3">
                        ST
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">SubTracker</h1>
                    <p className="text-xs text-gray-500 mt-1">Sign in to your subscription dashboard</p>
                </div>

                {/* Clean White Form Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    {error && (
                        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                            <AlertCircle size={15} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500"
                            >
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link
                                to="/register"
                                className="text-gray-900 font-semibold hover:underline"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
