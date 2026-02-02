'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Upload, X, Film, Image as ImageIcon, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
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

type Step = 'FILE' | 'DETAILS' | 'PREVIEW';

export default function UploadForm({ categories, type = 'REEL' }: UploadFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const uploadAbortController = useRef<AbortController | null>(null);

    const [currentStep, setCurrentStep] = useState<Step>('FILE');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        genreId: '',
        language: 'Hindi',
        releaseYear: new Date().getFullYear(),
        level: 'Standard',
        tags: '',
        contentRating: 'U',
        isFeatured: false,
        // Advanced Fields
        director: '',
        productionCompany: '',
        trailerUrl: '',
        rating: '',
        maturityRating: '',
        awards: '',
        videoQuality: 'HD',
        // Arrays
        cast: [] as string[],
        crew: [] as string[],
        audioLanguages: [] as string[],
        subtitles: [] as string[]
    });

    const [newItem, setNewItem] = useState({ cast: '', crew: '', audio: '', subtitle: '' });

    useEffect(() => {
        if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [videoFile]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addItem = (field: 'cast' | 'crew' | 'audioLanguages' | 'subtitles', value: string) => {
        if (!value.trim()) return;
        setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
        if (field === 'cast') setNewItem(prev => ({ ...prev, cast: '' }));
        if (field === 'crew') setNewItem(prev => ({ ...prev, crew: '' }));
    };

    const removeItem = (field: 'cast' | 'crew' | 'audioLanguages' | 'subtitles', index: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

    const handleSubmit = async () => {
        if (!videoFile) {
            setError('Please select a video file');
            return;
        }

        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        // Robust Validation to prevent crashes
        if (!formData.categoryId) {
            setError('Please select a category');
            return;
        }

        setError(null);
        setIsLoading(true);
        setIsUploading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('video', videoFile);
            if (thumbnailFile) formDataToSend.append('thumbnail', thumbnailFile);

            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description || formData.title);
            formDataToSend.append('category_id', formData.categoryId.toString());
            // Safe handling for optional fields
            if (formData.genreId) formDataToSend.append('genre_id', formData.genreId.toString());

            formDataToSend.append('type', type);
            formDataToSend.append('language', formData.language);
            formDataToSend.append('content_rating', formData.contentRating);
            formDataToSend.append('release_year', formData.releaseYear.toString());

            // Handle tags as array for backend
            if (formData.tags) {
                const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                formDataToSend.append('tags', JSON.stringify(tagsArray));
            }

            // Advanced Fields
            if (formData.director) formDataToSend.append('director', formData.director);
            if (formData.productionCompany) formDataToSend.append('productionCompany', formData.productionCompany);
            if (formData.rating) formDataToSend.append('rating', formData.rating);
            if (formData.videoQuality) formDataToSend.append('videoQuality', formData.videoQuality);
            if (formData.trailerUrl) formDataToSend.append('trailerUrl', formData.trailerUrl);
            if (formData.maturityRating) formDataToSend.append('maturityRating', formData.maturityRating);
            if (formData.awards) formDataToSend.append('awards', formData.awards);

            // JSON Arrays
            if (formData.cast.length > 0) formDataToSend.append('cast', JSON.stringify(formData.cast));
            if (formData.crew.length > 0) formDataToSend.append('crew', JSON.stringify(formData.crew));
            if (formData.audioLanguages.length > 0) formDataToSend.append('audioLanguages', JSON.stringify(formData.audioLanguages));
            if (formData.subtitles.length > 0) formDataToSend.append('subtitles', JSON.stringify(formData.subtitles));

            formDataToSend.append('is_active', 'true');
            formDataToSend.append('is_featured', formData.isFeatured ? 'true' : 'false');
            formDataToSend.append('is_trending', 'false');

            const response = await uploadWithProgress(formDataToSend);

            if (response.success) {
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
        <div className="space-y-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-4 mb-2">
                {[
                    { id: 'FILE', label: 'File' },
                    { id: 'DETAILS', label: 'Details' },
                    { id: 'PREVIEW', label: 'Review' }
                ].map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-4">
                        <button
                            disabled={idx > (['FILE', 'DETAILS', 'PREVIEW'].indexOf(currentStep))}
                            onClick={() => setCurrentStep(step.id as Step)}
                            className={`flex flex-col items-center gap-2 group transition-all ${currentStep === step.id ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'}`}
                        >
                            <div className={`w-10 h-10 rounded-[18px] flex items-center justify-center text-xs font-black transition-all ${currentStep === step.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                {idx + 1}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{step.label}</span>
                        </button>
                        {idx < 2 && <div className="w-12 h-[2px] bg-slate-100 dark:bg-white/5 mb-6" />}
                    </div>
                ))}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500 text-xs font-black uppercase tracking-widest animate-in shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Uploading Overlay */}
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-50/80 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] p-10 border border-slate-200 dark:border-white/10 shadow-2xl space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-[32px] bg-indigo-600/10 text-indigo-600 flex items-center justify-center mx-auto transition-transform animate-bounce">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Uploading Your Vision</h2>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                                Please keep this page open. Your video is being securely transmitted to our high-speed servers.
                            </p>
                        </div>

                        {uploadProgress && (
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 relative" style={{ width: `${uploadProgress.percentage}%` }}>
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-indigo-600">{uploadProgress.percentage}% Completed</span>
                                    <span className="text-slate-400">{formatBytes(uploadProgress.uploadedBytes)} / {formatBytes(uploadProgress.totalBytes)}</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleCancelUpload}
                                className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                            >
                                Abort Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 'FILE' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Choose your Source</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drag and drop or browse your local files</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Video Upload Zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-[40px] p-8 text-center transition-all group overflow-hidden ${videoFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-white/2'}`}
                            >
                                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="relative z-0 space-y-4">
                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto transition-all ${videoFile ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:scale-110'}`}>
                                        <Film className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate px-4">
                                            {videoFile ? videoFile.name : 'Select Video File'}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                            {videoFile ? formatBytes(videoFile.size) : 'Supported: MP4, MKV, MOV'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail Upload Zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-[40px] p-8 text-center transition-all group overflow-hidden ${thumbnailFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-white/10 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-white/2'}`}
                            >
                                <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) { setThumbnailFile(file); setThumbnailPreview(URL.createObjectURL(file)); }
                                }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                {thumbnailPreview ? (
                                    <div className="absolute inset-0 z-0">
                                        <Image src={thumbnailPreview} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Change Artwork</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Cover Image</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Highly Recommended</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-8">
                            <button
                                onClick={() => setCurrentStep('DETAILS')}
                                disabled={!videoFile}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:grayscale active:scale-95"
                            >
                                Next Step <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'DETAILS' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 max-w-2xl mx-auto">
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Content Information</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Help users discover your video</p>
                        </div>

                        <div className="space-y-6 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Creative Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        placeholder="What's your story called?"
                                        className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Placement</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => handleChange('categoryId', e.target.value)}
                                        className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold uppercase cursor-pointer focus:ring-2 focus:ring-indigo-600"
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Narration</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={3}
                                    placeholder="Write a brief overview of your content..."
                                    className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Release Year</label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2099"
                                        value={formData.releaseYear}
                                        onChange={(e) => handleChange('releaseYear', parseInt(e.target.value))}
                                        className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Language</label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => handleChange('language', e.target.value)}
                                        className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold uppercase cursor-pointer focus:ring-2 focus:ring-indigo-600"
                                    >
                                        {["Hindi", "English", "Maithili", "Bhojpuri", "Tamil", "Other"].map(l => (
                                            <option key={l} value={l} className="dark:bg-slate-900">{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Tags / Keywords</label>
                                <input
                                    value={formData.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                    placeholder="Action, Drama, 2024, Full Movie (Comma separated)"
                                    className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold uppercase placeholder:normal-case"
                                />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter pl-2">helps in search & recommendations</p>
                            </div>

                            {/* Advanced Fields: Cast & Crew */}
                            <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4">Cast & Crew</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Director</label>
                                            <input
                                                value={formData.director}
                                                onChange={(e) => handleChange('director', e.target.value)}
                                                className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Production Co.</label>
                                            <input
                                                value={formData.productionCompany}
                                                onChange={(e) => handleChange('productionCompany', e.target.value)}
                                                className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Cast Chips */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Cast Members</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={newItem.cast}
                                                onChange={(e) => setNewItem({ ...newItem, cast: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && addItem('cast', newItem.cast)}
                                                placeholder="Add Actor Name"
                                                className="flex-1 px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                                            />
                                            <button onClick={() => addItem('cast', newItem.cast)} className="px-6 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs">Add</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.cast.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                                                    {item} <button onClick={() => removeItem('cast', idx)}><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4">Technical & Media</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Video Quality</label>
                                        <select
                                            value={formData.videoQuality}
                                            onChange={(e) => handleChange('videoQuality', e.target.value)}
                                            className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold cursor-pointer"
                                        >
                                            {['SD', 'HD', 'FHD', '4K', '8K'].map(q => <option key={q} value={q} className="dark:bg-slate-900">{q}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Rating (0-10)</label>
                                        <input
                                            type="number"
                                            min="0" max="10" step="0.1"
                                            value={formData.rating}
                                            onChange={(e) => handleChange('rating', e.target.value)}
                                            className="w-full px-6 py-4 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>



                            {/* {type === 'VIDEO' && (
                                <div className="flex items-center gap-4 bg-white/50 dark:bg-black/40 p-6 rounded-2xl border border-slate-200 dark:border-white/10 group hover:border-indigo-500/50 transition-all cursor-pointer mt-6" onClick={() => handleChange('isFeatured', !formData.isFeatured)}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Feature on Home</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Showcase this video in the primary Hero section</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    />
                                </div>
                            )} */}
                        </div>

                        <div className="flex justify-between pt-8">
                            <button
                                onClick={() => setCurrentStep('FILE')}
                                className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" /> Go Back
                            </button>
                            <button
                                onClick={() => setCurrentStep('PREVIEW')}
                                disabled={!formData.title}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30 active:scale-95"
                            >
                                Review <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'PREVIEW' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Validation & Review</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Double check your content before going live</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                            <div className="md:col-span-7 space-y-6">
                                <div className="aspect-video bg-black rounded-[40px] overflow-hidden relative shadow-2xl border border-white/10">
                                    {videoPreview ? (
                                        <video src={videoPreview} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white font-black uppercase tracking-widest text-[10px]">Preview Unavailable</div>
                                    )}
                                </div>
                                <div className="p-8 rounded-[40px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Assets Ready</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Video and thumbnail passed local validation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-5 space-y-8 flex flex-col justify-between py-4">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Title</label>
                                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-3">{formData.title}</p>
                                    </div>

                                    {/* Primary Meta Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Category</label>
                                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">{categories.find(c => c.id == formData.categoryId)?.name || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Director</label>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">{formData.director || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Production</label>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase truncate">{formData.productionCompany || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Release Year</label>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{formData.releaseYear}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Language</label>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{formData.language}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Content Rating</label>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded border border-slate-300 dark:border-white/20 text-[10px] font-black uppercase text-slate-900 dark:text-white">
                                                {formData.contentRating}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Quality</label>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{formData.videoQuality}</span>
                                                {formData.rating && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">⭐ {formData.rating}</span>}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Size</label>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{formatBytes(videoFile?.size || 0)}</p>
                                        </div>
                                        {formData.trailerUrl && (
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Trailer</label>
                                                <a href={formData.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-500 hover:underline uppercase truncate block">View Link</a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cast Members */}
                                    {formData.cast.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Cast</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.cast.map((actor, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/5">
                                                        {actor}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Crew Members */}
                                    {formData.crew.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Crew</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.crew.map((item, i) => (
                                                    <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/5">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Languages & Subtitles */}
                                    {(formData.audioLanguages.length > 0 || formData.subtitles.length > 0) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {formData.audioLanguages.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Audio</label>
                                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{formData.audioLanguages.join(', ')}</p>
                                                </div>
                                            )}
                                            {formData.subtitles.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Subtitles</label>
                                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">{formData.subtitles.join(', ')}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Description</label>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-h-32 overflow-y-auto italic">
                                            "{formData.description || 'No description provided.'}"
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {isLoading ? 'Processing...' : 'Publish Video'}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-start">
                            <button
                                onClick={() => setCurrentStep('DETAILS')}
                                className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all underline underline-offset-8 decoration-indigo-500/30"
                            >
                                <ChevronLeft className="w-5 h-5" /> Edit Details
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
