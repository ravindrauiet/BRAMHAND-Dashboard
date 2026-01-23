'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function SignInPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/u/dashboard');
                router.refresh(); // Ensure session updates
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-white overflow-x-hidden">
            {/* Left Side: Cinematic Hero */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1974&auto=format&fit=crop")' }}>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                <div className="relative z-10 flex flex-col justify-end p-20 h-full max-w-2xl">
                    <div className="mb-8 p-4 glassmorphism rounded-2xl border-l-4 border-primary inline-block backdrop-blur-md bg-black/30">
                        <span className="material-symbols-outlined text-primary text-3xl mb-2">movie_filter</span>
                        <h1 className="text-5xl font-serif-display font-bold italic leading-tight">
                            "Stories that <span className="text-primary">echo</span> through time."
                        </h1>
                    </div>
                    <div className="space-y-4">
                        <p className="text-lg text-white/80 font-light tracking-wide">
                            Experience the rich heritage of Mithila through our curated collection of cinema and art.
                        </p>
                        <div className="flex items-center gap-4 text-sm font-medium text-white/60">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">verified</span> Verified Creators</span>
                            <span className="w-1 h-1 rounded-full bg-white/30"></span>
                            <span>4K Ultra HD</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-[#0a0a14]">
                <div className="w-full max-w-md space-y-6 relative z-10">
                    <div className="text-center space-y-2">
                        <Link href="/" className="inline-block mb-4 transform hover:scale-105 transition-transform">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mx-auto">
                                <span className="material-symbols-outlined text-black text-xl">diamond</span>
                            </div>
                        </Link>
                        <h2 className="text-3xl font-serif-display font-bold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Access your premium streaming dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Email/Username Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-300 ml-1">Email or Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                                </div>
                                <input
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all sm:text-sm"
                                    placeholder="Enter your email address"
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-medium text-gray-300">Password</label>
                                <a href="#" className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                                </div>
                                <input
                                    className="block w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors" type="button">
                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-black h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            type="submit"
                        >
                            {loading ? (
                                <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="material-symbols-outlined text-xl">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-[#0a0a14] px-4 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="flex items-center justify-center h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors gap-2 group">
                            <svg className="size-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M6.16 14.25c-.27-.81-.43-1.68-.43-2.56s.16-1.75.43-2.56V6.36H2.18C.79 9.13 0 12.29 0 15.63c0 3.35.79 6.51 2.18 9.27l3.98-3.08z" fill="#FBBC05"></path>
                                <path d="M12 4.75c1.62 0 3.07.56 4.22 1.64l3.19-3.19C17.45 1.45 14.96 0 12 0 7.7 0 3.99 2.47 2.18 6.36l3.98 3.08c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span className="text-xs font-medium text-white group-hover:text-white transition-colors">Google</span>
                        </button>
                        <button type="button" className="flex items-center justify-center h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors gap-2 group">
                            <span className="material-symbols-outlined text-lg text-white opacity-70 group-hover:opacity-100 transition-opacity">ios</span>
                            <span className="text-xs font-medium text-white group-hover:text-white transition-colors">Apple</span>
                        </button>
                    </div>

                    <p className="text-center text-xs text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
                            Sign up now
                        </Link>
                    </p>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
        </div>
    );
}
