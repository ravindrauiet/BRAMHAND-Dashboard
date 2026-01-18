'use client';

import { useState } from 'react';
import { Loader2, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { submitReel } from './actions';

export default function UploadReelForm({ categories }: { categories: any[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function clientAction(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await submitReel(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Reel uploaded successfully!' });
                // Reset form? Hard with FormData but we can reload or clear inputs via simple JS if needed, or just show success state.
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to upload reel.' });
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={clientAction} className="max-w-2xl mx-auto space-y-6">

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{message.text}</p>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Caption</label>
                    <input
                        name="title"
                        required
                        placeholder="My awesome reel #fun"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reel Video URL</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            name="videoUrl"
                            required
                            placeholder="https://example.com/reel.mp4"
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                    <select
                        name="categoryId"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                {isLoading ? 'Uploading...' : 'Upload Reel'}
            </button>
        </form>
    );
}
