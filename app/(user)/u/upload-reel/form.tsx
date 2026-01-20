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
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-900/20 rounded-xl p- space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Uploading {type === 'REEL' ? 'Reel' : 'Video'}...</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancelUpload}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {uploadProgress.percentage}%
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                                {formatBytes(uploadProgress.speed)}/s • {formatTime(uploadProgress.estimatedTimeRemaining)} remaining
                            </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${uploadProgress.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {type === 'REEL' ? 'Caption' : 'Title'}
                    </label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        required
                        placeholder={type === 'REEL' ? 'My awesome reel #fun' : 'Enter video title...'}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {/* Video File */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                        <Film className="w-4 h-4 text-pink-500" />
                        {type === 'REEL' ? 'Reel Video File' : 'Video File'}
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        required
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setVideoFile(file);
                            }
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                    />
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        Thumbnail (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setThumbnailFile(file);
                                const url = URL.createObjectURL(file);
                                setThumbnailPreview(url);
                            }
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {thumbnailPreview && (
                        <div className="mt-3 relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                        </div>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Category
                    </label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
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
                {isLoading ? 'Uploading...' : `Upload ${type === 'REEL' ? 'Reel' : 'Video'}`}
            </button>
        </form>
    );
}
