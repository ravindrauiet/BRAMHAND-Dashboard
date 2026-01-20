'use client';

import { useState, useRef } from 'react';
import { Play, Film, Loader2, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Type, FileText, Globe, Shield, Eye, X, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface VideoEditorProps {
    video?: any;
    categories: any[];
    creators: any[];
}

interface UploadProgress {
    percentage: number;
    uploadedBytes: number;
    totalBytes: number;
    speed: number; // bytes per second
    estimatedTimeRemaining: number; // seconds
}

export function VideoEditor({ video, categories, creators }: VideoEditorProps) {
    const isEditing = !!video;
    const router = useRouter();
    const { data: session } = useSession();
    const uploadAbortController = useRef<AbortController | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    // File refs to hold the actual files
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    // Initialize state with video data or defaults
    const [formData, setFormData] = useState({
        title: video?.title || '',
        description: video?.description || '',
        thumbnailUrl: video?.thumbnailUrl || '',
        videoUrl: video?.videoUrl || '',
        categoryId: video?.categoryId || '',
        creatorId: video?.creatorId || '',
        language: video?.language || 'Hindi',
        contentRating: video?.contentRating || 'U',
        isActive: video?.isActive ?? true,
        isTrending: video?.isTrending ?? false,
        isFeatured: video?.isFeatured ?? false,
        type: video?.type || 'VIDEO',
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
                    const timeDiff = (currentTime - lastTime) / 1000; // seconds
                    const bytesDiff = e.loaded - lastLoaded;

                    // Calculate speed (bytes per second)
                    const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;

                    // Calculate remaining time
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
            xhr.open('POST', `${apiUrl}/admin/videos`);

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

        if (!isEditing && !videoFile) {
            setError('Please select a video file');
            return;
        }

        setError(null);
        setIsLoading(true);
        setIsUploading(true);

        try {
            const formDataToSend = new FormData();

            // Add files
            if (videoFile) {
                formDataToSend.append('video', videoFile);
            }
            if (thumbnailFile) {
                formDataToSend.append('thumbnail', thumbnailFile);
            }

            // Add all form fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('categoryId', formData.categoryId.toString());
            formDataToSend.append('creatorId', formData.creatorId.toString());
            formDataToSend.append('language', formData.language);
            formDataToSend.append('contentRating', formData.contentRating);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('isActive', formData.isActive.toString());
            formDataToSend.append('isTrending', formData.isTrending.toString());
            formDataToSend.append('isFeatured', formData.isFeatured.toString());

            const response = await uploadWithProgress(formDataToSend);

            if (response.success) {
                // Success! Redirect to videos page
                router.push('/dashboard/videos');
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

    const selectedCategoryName = categories.find(c => c.id.toString() === formData.categoryId.toString())?.name || 'Category';
    const selectedCreatorName = creators.find(c => c.id.toString() === formData.creatorId.toString())?.fullName || 'Creator Name';

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Video' : 'New Video'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the details below to publish your content.</p>
                    </div>
                    <Link href="/dashboard/videos" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>

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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-900/20 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Uploading Video...</h3>
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

                        {/* Progress Bar */}
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

                {/* Main Form Card */}
                <div className="glass-card p-8 rounded-2xl space-y-6">
                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" /> Video Title
                            </label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                placeholder="Enter an engaging title..."
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
                                placeholder="What is this video about?"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    {/* Media Inputs with File Support */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-pink-500" /> Video File
                            </label>
                            {isEditing ? (
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-500">
                                    Video replacement not supported in edit mode yet.
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    name="video" // Must match backend field name
                                    accept="video/*"
                                    required={!isEditing}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setVideoFile(file);
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-amber-500" /> Thumbnail File
                            </label>
                            {isEditing ? (
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-500">
                                    Thumbnail replacement not supported in edit mode yet.
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    name="thumbnail" // Must match backend field name
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setThumbnailFile(file);
                                            const url = URL.createObjectURL(file);
                                            handleChange('thumbnailUrl', url); // Update preview
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                />
                            )}
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                            <div className="relative">
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
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Creator</label>
                            <select
                                name="creatorId"
                                value={formData.creatorId}
                                onChange={(e) => handleChange('creatorId', e.target.value)}
                                required
                                disabled={isEditing}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none disabled:opacity-60 text-slate-900 dark:text-white"
                            >
                                <option value="">Select Creator</option>
                                {creators.map(c => (
                                    <option key={c.id} value={c.id}>{c.fullName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-cyan-500" /> Language
                            </label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="Hindi">Hindi</option>
                                <option value="English">English</option>
                                <option value="Bhojpuri">Bhojpuri</option>
                                <option value="Maithili">Maithili</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" /> Content Rating
                            </label>
                            <select
                                name="contentRating"
                                value={formData.contentRating}
                                onChange={(e) => handleChange('contentRating', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="U">U (Universal)</option>
                                <option value="UA">UA (Parental Guidance)</option>
                                <option value="A">A (Adults Only)</option>
                                <option value="S">S (Specialized)</option>
                                <option value="UA_13_PLUS">U/A 13+</option>
                                <option value="UA_16_PLUS">U/A 16+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                <Film className="w-4 h-4 text-rose-500" /> Video Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                            >
                                <option value="VIDEO">Standard Video</option>
                                <option value="REEL">Reel (Shorts)</option>
                            </select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Active Status</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isTrending"
                                    checked={formData.isTrending}
                                    onChange={(e) => handleChange('isTrending', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors">Trending</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">Featured</span>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isEditing ? 'Save Changes' : 'Publish Video'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Preview Column */}
            <div className="space-y-6">
                <div className="sticky top-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" /> Live Preview
                    </h3>

                    {/* Preview Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 group cursor-pointer">
                            {formData.thumbnailUrl ? (
                                <Image src={formData.thumbnailUrl} alt="Preview" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <Film className="w-12 h-12 mb-2" />
                                    <span className="text-sm">No Thumbnail</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-white/30 backdrop-blur rounded-full flex items-center justify-center">
                                    <Play className="w-5 h-5 text-white fill-current" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                {formData.contentRating}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                    {formData.title || 'Untitled Video'}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span>{selectedCategoryName}</span>
                                    <span>•</span>
                                    <span>{formData.language}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                                    {selectedCreatorName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{selectedCreatorName}</p>
                                    <p className="text-xs text-slate-500 truncate">Creator</p>
                                </div>
                            </div>

                            {/* Tags Preview */}
                            <div className="flex items-center gap-2 pt-1">
                                {formData.isTrending && (
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                                        Trending
                                    </span>
                                )}
                                {formData.isFeatured && (
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold border border-purple-200">
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview Info */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
                        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                            <span className="font-semibold block mb-1">💡 Pro Tip:</span>
                            Eye-catching thumbnails and concise titles (under 60 chars) improve click-through rates by up to 40%.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
