'use client';

import { useState, useRef } from 'react';
import { Play, Loader2, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Type, FileText, X, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface SeriesEditorProps {
    series?: any;
    categories: any[];
    creators: any[];
}

interface UploadProgress {
    percentage: number;
    uploadedBytes: number;
    totalBytes: number;
    speed: number;
    estimatedTimeRemaining: number;
}

export function SeriesEditor({ series, categories, creators }: SeriesEditorProps) {
    const isEditing = !!series;
    const router = useRouter();
    const { data: session } = useSession();
    const uploadAbortController = useRef<AbortController | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: series?.title || '',
        description: series?.description || '',
        thumbnailUrl: series?.thumbnailUrl || '',
        coverImageUrl: series?.coverImageUrl || '',
        categoryId: series?.categoryId || '',
        creatorId: series?.creatorId || '',
        isActive: series?.isActive ?? true,
        isFeatured: series?.isFeatured ?? false,
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
            // Use PUT/PATCH for edit, POST for new. For now Series controller uses PATCH for update.
            const method = isEditing ? 'PATCH' : 'POST';
            const url = isEditing ? `${apiUrl}/series/${series.id}` : `${apiUrl}/series`;

            xhr.open(method, url);

            // @ts-ignore
            const token = session?.accessToken;
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            // Note: If edit mode and not multipart (no files), we might need to send JSON instead.
            // But we are using FormData always to support potential file updates. 
            // Backend middleware should handle multer even for updates usually, checking only present files.

            xhr.send(formDataToSend);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setIsLoading(true);
        setIsUploading(true);

        try {
            const formDataToSend = new FormData();

            if (thumbnailFile) formDataToSend.append('thumbnail', thumbnailFile);
            if (coverImageFile) formDataToSend.append('coverImage', coverImageFile);

            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('categoryId', formData.categoryId.toString());
            formDataToSend.append('creatorId', formData.creatorId.toString());
            formDataToSend.append('isActive', formData.isActive.toString());
            formDataToSend.append('isFeatured', formData.isFeatured.toString());

            const response = await uploadWithProgress(formDataToSend);

            if (response.success) {
                router.push('/dashboard/series');
                router.refresh();
            } else {
                setError(response.message || 'Operation failed');
                setIsUploading(false);
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Operation failed');
            setIsUploading(false);
            setUploadProgress(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Series' : 'New Series'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a collection for your episodes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to delete this series? This action cannot be undone.')) return;
                                    try {
                                        setIsLoading(true);
                                        // @ts-ignore
                                        const token = session?.accessToken;
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/series/${series.id}`, {
                                            method: 'DELETE',
                                            headers: {
                                                'Authorization': `Bearer ${token}`
                                            }
                                        });
                                        if (res.ok) {
                                            router.push('/dashboard/series');
                                            router.refresh();
                                        } else {
                                            throw new Error('Failed to delete series');
                                        }
                                    } catch (err: any) {
                                        setError(err.message);
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-red-500 hover:text-red-600"
                                title="Delete Series"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <Link href="/dashboard/series" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 flex items-start gap-3">
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className="glass-card p-8 rounded-2xl space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" /> Series Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                placeholder="e.g., The Epic Saga Season 1"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={(e) => handleChange('categoryId', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Creator</label>
                            <select
                                name="creatorId"
                                value={formData.creatorId}
                                onChange={(e) => handleChange('creatorId', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-900 dark:text-white"
                            >
                                <option value="">Select Creator</option>
                                {creators.map(c => (
                                    <option key={c.id} value={c.userId}>{c.user?.fullName || c.popularName || 'Unknown'}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-amber-500" /> Vertical Thumbnail
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setThumbnailFile(file);
                                        handleChange('thumbnailUrl', URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-purple-500" /> Horizontal Cover (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setCoverImageFile(file);
                                        handleChange('coverImageUrl', URL.createObjectURL(file));
                                    }
                                }}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Active</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Featured</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isEditing ? 'Save Changes' : 'Create Series'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Preview</h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="relative aspect-[2/3] bg-slate-100 dark:bg-slate-800">
                        {formData.thumbnailUrl && (
                            <Image src={formData.thumbnailUrl} alt="Preview" fill className="object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                            <h4 className="text-white font-bold text-xl">{formData.title || 'Series Title'}</h4>
                            <p className="text-white/80 text-sm line-clamp-2">{formData.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </form >
    );
}
