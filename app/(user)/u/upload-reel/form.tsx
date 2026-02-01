'use client';

import { useState, useRef } from 'react';
import { Loader2, Upload, X, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UploadProgress {
    percentage: number;
    uploadedBytes: number;
    totalBytes: number;
    speed: number;
    estimatedTimeRemaining: number;
}

interface UploadFormProps {
    categories: any[];
    type?: 'VIDEO' | 'REEL';
}

export default function UploadForm({ categories, type = 'REEL' }: UploadFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const uploadAbortController = useRef<AbortController | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        categoryId: categories[0]?.id || '',
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || seconds < 0) return 'Calculating...';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    };

    const handleCancelUpload = () => {
        if (uploadAbortController.current) {
            uploadAbortController.current.abort();
            uploadAbortController.current = null;
        }
        setIsUploading(false);
        setUploadProgress(null);
        setError(null);
    };

    const uploadWithProgress = async (formDataToSend: FormData): Promise<any> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            uploadAbortController.current = new AbortController();

            const startTime = Date.now();
            let lastLoaded = 0;
            let lastTime = startTime;

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const currentTime = Date.now();
                    const timeDiff = (currentTime - lastTime) / 1000;
                    const bytesDiff = e.loaded - lastLoaded;

                    const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
                    const remainingBytes = e.total - e.loaded;
                    const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : 0;
                    const percentage = Math.round((e.loaded / e.total) * 100);

                    setUploadProgress({
                        percentage,
                        uploadedBytes: e.loaded,
                        totalBytes: e.total,
                        speed,
                        estimatedTimeRemaining
                    });

                    lastLoaded = e.loaded;
                    lastTime = currentTime;
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(new Error(error.message || 'Upload failed'));
                    } catch (e) {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            xhr.open('POST', `${apiUrl}/videos`);

            // @ts-ignore
            const token = session?.accessToken;
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(formDataToSend);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!videoFile) {
            setError('Please select a video file');
            return;
        }

        setError(null);
        setIsLoading(true);
        setIsUploading(true);


        try {
            const formDataToSend = new FormData();

            // Add files
            formDataToSend.append('video', videoFile);
            if (thumbnailFile) {
                formDataToSend.append('thumbnail', thumbnailFile);
            }

            // Add all form fields with proper defaults
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category_id', formData.categoryId.toString());
            formDataToSend.append('type', type);

            // Add defaults for optional fields to match database schema
            formDataToSend.append('description', formData.title); // Use title as description by default
            formDataToSend.append('language', 'Hindi'); // Default language
            formDataToSend.append('content_rating', 'U'); // Universal rating by default
            formDataToSend.append('is_active', 'true'); // Active by default
            formDataToSend.append('is_featured', 'false'); // Not featured
            formDataToSend.append('is_trending', 'false'); // Not trending

            console.log('Uploading with data:', {
                title: formData.title,
                category_id: formData.categoryId,
                type,
                hasVideo: !!videoFile,
                hasThumbnail: !!thumbnailFile
            });

            const response = await uploadWithProgress(formDataToSend);

            if (response.success) {
                console.log('Upload successful, redirecting to dashboard');
                router.push('/u/dashboard');
            } else {
                setError(response.message || 'Upload failed');
                setIsUploading(false);
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed');
            setIsUploading(false);
            setUploadProgress(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
            {/* Error Display */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-500 text-xs font-bold">
                    <X className="w-4 h-4" />
                    <p className="flex-1">{error}</p>
                    <button type="button" onClick={() => setError(null)}><X className="w-3 h-3" /></button>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
                <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Uploading...</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                    {formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleCancelUpload} className="text-[10px] font-bold text-rose-500 uppercase hover:underline">Cancel</button>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress.percentage}%` }} />
                    </div>
                </div>
            )}

            <div className="space-y-5 text-left">
                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                        {type === 'REEL' ? 'Caption' : 'Video Title'}
                    </label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                        placeholder="Enter title..."
                        className="w-full px-4 py-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
                    />
                </div>

                {/* File Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Video File</label>
                        <div className="relative border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-6 text-center hover:border-indigo-500 transition-all group overflow-hidden bg-slate-50/50 dark:bg-white/2">
                            <input type="file" accept="video/*" required onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Film className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate max-w-full">
                                {videoFile ? videoFile.name : 'Select Video'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Thumbnail</label>
                        <div className="relative border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-1 text-center hover:border-indigo-500 transition-all min-h-[92px] flex items-center justify-center bg-slate-50/50 dark:bg-white/2">
                            <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { setThumbnailFile(file); setThumbnailPreview(URL.createObjectURL(file)); }
                            }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                            {thumbnailPreview ? (
                                <Image src={thumbnailPreview} alt="Preview" fill className="object-cover rounded-lg" />
                            ) : (
                                <div className="space-y-1">
                                    <ImageIcon className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Add Art</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-medium cursor-pointer"
                    >
                        {categories.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isLoading ? 'Processing...' : `Submit ${type}`}
            </button>
        </form>
    );
}
