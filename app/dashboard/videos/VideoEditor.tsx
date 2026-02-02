'use client';

import { useState, useRef } from 'react';
import { Play, Film, Loader2, Save, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Type, FileText, Globe, Shield, Eye, X, Upload, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface VideoEditorProps {
    video?: any;
    categories: any[];
    creators: any[];
    seriesList?: any[]; // Optional for backward compatibility, but we pass it now
}

interface UploadProgress {
    percentage: number;
    uploadedBytes: number;
    totalBytes: number;
    speed: number; // bytes per second
    estimatedTimeRemaining: number; // seconds
}

export function VideoEditor({ video, categories, creators, seriesList = [] }: VideoEditorProps) {
    const isEditing = !!video;
    const router = useRouter();
    const { data: session } = useSession();
    const uploadAbortController = useRef<AbortController | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

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
        // Series Fields
        seriesId: video?.seriesId || '',
        episodeNumber: video?.episodeNumber || '',
        seasonNumber: video?.seasonNumber || 1,
        // Netflix-style Metadata
        cast: video?.cast ? JSON.stringify(video.cast) : '[]',
        crew: video?.crew ? JSON.stringify(video.crew) : '[]',
        tags: video?.tags ? JSON.stringify(video.tags) : '[]',
        releaseDate: video?.release_date || video?.releaseDate || '',
        releaseYear: video?.release_year || video?.releaseYear || '',
        trailerUrl: video?.trailer_url || video?.trailerUrl || '',
        rating: video?.rating || '',
        maturityRating: video?.maturity_rating || video?.maturityRating || '',
        country: video?.country || '',
        productionCompany: video?.production_company || video?.productionCompany || '',
        director: video?.director || '',
        awards: video?.awards || '',
        subtitles: video?.subtitles ? JSON.stringify(video.subtitles) : '[]',
        audioLanguages: video?.audio_languages || video?.audioLanguages ? JSON.stringify(video.audio_languages || video.audioLanguages) : '[]',
        videoQuality: video?.video_quality || video?.videoQuality || 'HD',
        // SEO Fields (optional - backend auto-generates)
        slug: video?.slug || '',
        seoTitle: video?.seo_title || video?.seoTitle || '',
        seoDescription: video?.seo_description || video?.seoDescription || '',
        seoKeywords: video?.seo_keywords || video?.seoKeywords || '',
        ogImage: video?.og_image || video?.ogImage || '',
        ogTitle: video?.og_title || video?.ogTitle || '',
        ogDescription: video?.og_description || video?.ogDescription || '',
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

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentage = Math.round((e.loaded / e.total) * 100);
                    // Simplified progress for brevity in code snippet, ideally same calc logic
                    setUploadProgress({
                        percentage,
                        uploadedBytes: e.loaded,
                        totalBytes: e.total,
                        speed: 0,
                        estimatedTimeRemaining: 0
                    });
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
                        // Attempt to parse text if JSON fails
                        reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
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

            if (isEditing) {
                xhr.open('PATCH', `${apiUrl}/admin/videos/${video.id}`);
            } else {
                xhr.open('POST', `${apiUrl}/admin/videos`);
            }

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

            if (videoFile) formDataToSend.append('video', videoFile);
            if (thumbnailFile) formDataToSend.append('thumbnail', thumbnailFile);

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

            // Add Series Data if selected
            if (formData.seriesId) {
                formDataToSend.append('seriesId', formData.seriesId.toString());
                if (formData.episodeNumber) formDataToSend.append('episodeNumber', formData.episodeNumber.toString());
                if (formData.seasonNumber) formDataToSend.append('seasonNumber', formData.seasonNumber.toString());
            }

            // Netflix-style Metadata
            if (formData.cast) formDataToSend.append('cast', formData.cast);
            if (formData.crew) formDataToSend.append('crew', formData.crew);
            if (formData.tags) formDataToSend.append('tags', formData.tags);
            if (formData.releaseDate) formDataToSend.append('releaseDate', formData.releaseDate);
            if (formData.releaseYear) formDataToSend.append('releaseYear', formData.releaseYear.toString());
            if (formData.trailerUrl) formDataToSend.append('trailerUrl', formData.trailerUrl);
            if (formData.rating) formDataToSend.append('rating', formData.rating.toString());
            if (formData.maturityRating) formDataToSend.append('maturityRating', formData.maturityRating);
            if (formData.country) formDataToSend.append('country', formData.country);
            if (formData.productionCompany) formDataToSend.append('productionCompany', formData.productionCompany);
            if (formData.director) formDataToSend.append('director', formData.director);
            if (formData.awards) formDataToSend.append('awards', formData.awards);
            if (formData.subtitles) formDataToSend.append('subtitles', formData.subtitles);
            if (formData.audioLanguages) formDataToSend.append('audioLanguages', formData.audioLanguages);
            if (formData.videoQuality) formDataToSend.append('videoQuality', formData.videoQuality);

            // SEO Fields (optional - backend can auto-generate)
            if (formData.slug) formDataToSend.append('slug', formData.slug);
            if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
            if (formData.seoDescription) formDataToSend.append('seoDescription', formData.seoDescription);
            if (formData.seoKeywords) formDataToSend.append('seoKeywords', formData.seoKeywords);
            if (formData.ogImage) formDataToSend.append('ogImage', formData.ogImage);
            if (formData.ogTitle) formDataToSend.append('ogTitle', formData.ogTitle);
            if (formData.ogDescription) formDataToSend.append('ogDescription', formData.ogDescription);

            const response = await uploadWithProgress(formDataToSend);

            if (response.success) {
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
    const selectedSeriesName = seriesList.find(s => s.id.toString() === formData.seriesId.toString())?.title;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'media', label: 'Media', icon: Film },
        { id: 'details', label: 'Details', icon: Layers },
        { id: 'technical', label: 'Technical', icon: Shield },
        { id: 'seo', label: 'SEO', icon: Globe },
    ];

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{isEditing ? 'Edit Video' : 'New Video'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage content & metadata.</p>
                    </div>
                    <Link href="/dashboard/videos" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 flex items-start text-red-600">
                        {error}
                    </div>
                )}

                {isUploading && uploadProgress && (
                    <div className="p-4 bg-blue-50 text-blue-700 rounded-xl mb-4">
                        Uploading: {uploadProgress.percentage}%
                    </div>
                )}

                <div className="glass-card p-8 rounded-2xl space-y-6 min-h-[500px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                                        placeholder={formData.seriesId ? "e.g., Episode 1: Pilot" : "Enter video title"}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
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
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Series Selection Section */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-500" /> Series & Episode Linking
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Select Series (Optional)</label>
                                        <select
                                            name="seriesId"
                                            value={formData.seriesId}
                                            onChange={(e) => handleChange('seriesId', e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        >
                                            <option value="">None (Standalone Video)</option>
                                            {seriesList.map(s => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.seriesId && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Season Number</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.seasonNumber}
                                                    onChange={(e) => handleChange('seasonNumber', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Episode Number</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.episodeNumber}
                                                    onChange={(e) => handleChange('episodeNumber', e.target.value)}
                                                    placeholder="e.g. 1"
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => handleChange('categoryId', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">Creator</label>
                                    <select
                                        value={formData.creatorId}
                                        onChange={(e) => handleChange('creatorId', e.target.value)}
                                        required
                                        disabled={isEditing}
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900"
                                    >
                                        <option value="">Select Creator</option>
                                        {creators.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-500" /> Visibility & Status
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={formData.isTrending} onChange={(e) => handleChange('isTrending', e.target.checked)} className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trending</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-pink-500" /> Video File
                                    </label>
                                    {isEditing ? (
                                        <div className="p-3 bg-slate-100 text-sm text-slate-500 rounded-xl">Replacement not in edit mode</div>
                                    ) : (
                                        <input
                                            type="file"
                                            accept="video/*"
                                            required={!isEditing}
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-pink-500" /> Thumbnail
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                setThumbnailFile(f);
                                                handleChange('thumbnailUrl', URL.createObjectURL(f));
                                            }
                                        }}
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Netflix-Style Metadata Sections */}

                            {/* Cast & Crew Section */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Film className="w-4 h-4 text-blue-500" /> Cast & Crew
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            Cast (JSON array)
                                            <span className="text-slate-400 ml-1">e.g., ["Actor 1", "Actor 2"]</span>
                                        </label>
                                        <textarea
                                            value={formData.cast}
                                            onChange={(e) => handleChange('cast', e.target.value)}
                                            rows={3}
                                            placeholder='["Tom Hanks", "Emma Stone"]'
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            Crew (JSON array)
                                            <span className="text-slate-400 ml-1">e.g., ["Producer", "Writer"]</span>
                                        </label>
                                        <textarea
                                            value={formData.crew}
                                            onChange={(e) => handleChange('crew', e.target.value)}
                                            rows={3}
                                            placeholder='["John Producer", "Jane Writer"]'
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Release Information */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-500" /> Release Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Release Date</label>
                                        <input
                                            type="date"
                                            value={formData.releaseDate}
                                            onChange={(e) => handleChange('releaseDate', e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Release Year</label>
                                        <input
                                            type="number"
                                            min="1900"
                                            max="2100"
                                            value={formData.releaseYear}
                                            onChange={(e) => handleChange('releaseYear', e.target.value)}
                                            placeholder="2024"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Country</label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => handleChange('country', e.target.value)}
                                            placeholder="India"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media Details */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Film className="w-4 h-4 text-purple-500" /> Media Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Director</label>
                                        <input
                                            type="text"
                                            value={formData.director}
                                            onChange={(e) => handleChange('director', e.target.value)}
                                            placeholder="Christopher Nolan"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Production Company</label>
                                        <input
                                            type="text"
                                            value={formData.productionCompany}
                                            onChange={(e) => handleChange('productionCompany', e.target.value)}
                                            placeholder="Warner Bros"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Rating (0-10)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            value={formData.rating}
                                            onChange={(e) => handleChange('rating', e.target.value)}
                                            placeholder="8.5"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Maturity Rating</label>
                                        <select
                                            value={formData.maturityRating}
                                            onChange={(e) => handleChange('maturityRating', e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        >
                                            <option value="">Not Specified</option>
                                            <option value="TV-Y">TV-Y (All Children)</option>
                                            <option value="TV-Y7">TV-Y7 (7+)</option>
                                            <option value="TV-G">TV-G (General Audience)</option>
                                            <option value="TV-PG">TV-PG (Parental Guidance)</option>
                                            <option value="TV-14">TV-14 (14+)</option>
                                            <option value="TV-MA">TV-MA (Mature Audience)</option>
                                            <option value="G">G (General)</option>
                                            <option value="PG">PG</option>
                                            <option value="PG-13">PG-13</option>
                                            <option value="R">R (Restricted)</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Trailer URL</label>
                                        <input
                                            type="url"
                                            value={formData.trailerUrl}
                                            onChange={(e) => handleChange('trailerUrl', e.target.value)}
                                            placeholder="https://example.com/trailer.mp4"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Awards & Nominations</label>
                                        <textarea
                                            value={formData.awards}
                                            onChange={(e) => handleChange('awards', e.target.value)}
                                            rows={2}
                                            placeholder="Won 4 Oscars, Nominated for 8 Academy Awards..."
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'technical' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Technical Specifications */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500" /> Technical Specifications
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Video Quality</label>
                                        <select
                                            value={formData.videoQuality}
                                            onChange={(e) => handleChange('videoQuality', e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                        >
                                            <option value="SD">SD (480p)</option>
                                            <option value="HD">HD (720p)</option>
                                            <option value="FHD">Full HD (1080p)</option>
                                            <option value="2K">2K</option>
                                            <option value="4K">4K (2160p)</option>
                                            <option value="8K">8K</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            Audio Languages (JSON)
                                            <span className="text-slate-400 ml-1">e.g., ["Hindi", "English"]</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.audioLanguages}
                                            onChange={(e) => handleChange('audioLanguages', e.target.value)}
                                            placeholder='["Hindi", "English"]'
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            Subtitles (JSON)
                                            <span className="text-slate-400 ml-1">e.g., ["English", "Hindi"]</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subtitles}
                                            onChange={(e) => handleChange('subtitles', e.target.value)}
                                            placeholder='["English", "Hindi"]'
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                            Tags (JSON array)
                                            <span className="text-slate-400 ml-1">For search & filtering</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => handleChange('tags', e.target.value)}
                                            placeholder='["action", "thriller", "adventure"]'
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* SEO Section (Optional - Auto-generated by backend) */}
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/20">
                                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-4">
                                    <Globe className="w-4 h-4" /> SEO Fields (Optional - Auto-generated if empty)
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">SEO Title (60 chars max)</label>
                                            <input
                                                type="text"
                                                maxLength={60}
                                                value={formData.seoTitle}
                                                onChange={(e) => handleChange('seoTitle', e.target.value)}
                                                placeholder="Auto-generated from title"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">URL Slug</label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => handleChange('slug', e.target.value)}
                                                placeholder="auto-generated-from-title-2024"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">SEO Description (160 chars max)</label>
                                        <textarea
                                            maxLength={160}
                                            value={formData.seoDescription}
                                            onChange={(e) => handleChange('seoDescription', e.target.value)}
                                            rows={2}
                                            placeholder="Auto-generated from description, cast, director..."
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">SEO Keywords (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={formData.seoKeywords}
                                            onChange={(e) => handleChange('seoKeywords', e.target.value)}
                                            placeholder="action, thriller, drama, bollywood"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">OG Title (Social Media)</label>
                                            <input
                                                type="text"
                                                value={formData.ogTitle}
                                                onChange={(e) => handleChange('ogTitle', e.target.value)}
                                                placeholder="Auto-generated from SEO title"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">OG Image URL</label>
                                            <input
                                                type="url"
                                                value={formData.ogImage}
                                                onChange={(e) => handleChange('ogImage', e.target.value)}
                                                placeholder="Uses thumbnail if empty"
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">OG Description</label>
                                        <textarea
                                            value={formData.ogDescription}
                                            onChange={(e) => handleChange('ogDescription', e.target.value)}
                                            rows={2}
                                            placeholder="Auto-generated from SEO description"
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Save />}
                            {isEditing ? 'Save Changes' : 'Publish Video'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Column */}
            <div className="space-y-6 lg:sticky lg:top-6 h-fit">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="bg-white border rounded-2xl overflow-hidden shadow-lg">
                    <div className="relative aspect-video bg-slate-100">
                        {formData.thumbnailUrl ? (
                            <Image src={formData.thumbnailUrl} alt="Preview" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400"><Film /></div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                            {formData.contentRating}
                        </div>
                    </div>
                    <div className="p-4">
                        <h4 className="font-semibold line-clamp-2">{formData.title || 'Untitled Video'}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span>{selectedCategoryName}</span>
                            {selectedSeriesName && (
                                <span className="text-purple-600 font-medium px-1 bg-purple-50 rounded">
                                    S{formData.seasonNumber} E{formData.episodeNumber} • {selectedSeriesName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Status Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
                    <div className="flex justify-between">
                        <span>Quality:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formData.videoQuality}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-slate-500'}`}>
                            {formData.isActive ? 'Active' : 'Draft'}
                        </span>
                    </div>
                </div>
            </div>
        </form>
    );
}
