'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Using base API URL
            // Adjusting endpoint to match backend structure: http://localhost:5000/auth/register
            // If NEXT_PUBLIC_API_URL is 'http://localhost:5000/api', then `${apiUrl}/auth/register` might be 'http://localhost:5000/api/auth/register'.
            // Based on server.js, app.use(['/api/auth', '/auth'], authRoutes); so both /api/auth/register and /auth/register work.
            // I'll use the safe concatenation.

            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile_or_email: formData.email,
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/signin');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30 overflow-x-hidden">
            {/* Left Section: Visual Collage */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0a0a14]">
                <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 opacity-60">
                    <div className="space-y-4 animate-scroll-up">
                        <div className="h-64 rounded-2xl bg-[url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000')] bg-cover bg-center"></div>
                        <div className="h-48 rounded-2xl bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000')] bg-cover bg-center"></div>
                        <div className="h-72 rounded-2xl bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8efe30?q=80&w=1000')] bg-cover bg-center"></div>
                    </div>
                    <div className="space-y-4 animate-scroll-down pt-12">
                        <div className="h-56 rounded-2xl bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000')] bg-cover bg-center"></div>
                        <div className="h-80 rounded-2xl bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000')] bg-cover bg-center"></div>
                        <div className="h-40 rounded-2xl bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=1000')] bg-cover bg-center"></div>
                    </div>
                </div>
                <div className="absolute inset-0 collage-overlay"></div>
                <div className="relative z-10 flex flex-col justify-center px-12 h-full">
                    <h2 className="text-5xl font-black font-serif-display italic mb-6 leading-tight">
                        "Your <span className="text-primary">Gateway</span> to Eternal <br /> Stories."
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {['Free Originals', '4K Streaming', 'Community'].map((tag) => (
                            <span key={tag} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-bold">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Section: Sign Up Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-10 bg-[#0a0a14] relative">
                <div className="w-full max-w-lg space-y-4 relative z-10">
                    <div className="text-left">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                            <span className="material-symbols-outlined text-primary text-2xl transition-transform group-hover:-translate-x-1">arrow_back</span>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
                        </Link>
                        <h2 className="text-3xl font-serif-display font-bold text-white mb-1 ml-1">Create Account</h2>
                        <p className="text-gray-400 text-xs ml-1">Start your premium streaming experience today.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Account created successfully! Redirecting...
                        </div>
                    )}

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-300 ml-1">Full Name</label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className="w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 h-10 px-4 placeholder:text-gray-600 transition-all font-medium text-sm"
                                placeholder="Enter your full name"
                                type="text"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-300 ml-1">Email Address</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 h-10 px-4 placeholder:text-gray-600 transition-all font-medium text-sm"
                                placeholder="example@email.com"
                                type="email"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 h-10 px-4 placeholder:text-gray-600 transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-white transition-colors text-base">visibility</span>
                                </div>
                                {/* Strength Meter */}
                                <div className="flex gap-1 h-0.5 mt-1 px-1">
                                    <div className={`flex-1 rounded-full ${formData.password.length > 0 ? (formData.password.length > 6 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-white/10'}`}></div>
                                    <div className={`flex-1 rounded-full ${formData.password.length > 8 ? 'bg-green-500' : 'bg-white/10'}`}></div>
                                    <div className={`flex-1 rounded-full bg-white/10`}></div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-300 ml-1">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 h-10 px-4 placeholder:text-gray-600 transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-center gap-2 py-1 ml-1">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50" required />
                            <label className="text-[10px] text-gray-400">
                                I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-black font-bold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            type="submit"
                        >
                            {loading ? <span className="animate-spin material-symbols-outlined text-base">progress_activity</span> : null}
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="font-bold text-primary hover:text-primary/80 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
        </div>
    );
}
