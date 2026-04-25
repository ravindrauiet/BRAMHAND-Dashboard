'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Upload, X, Film, Image as ImageIcon, Sparkles, CheckCircle2,
    ChevronRight, ChevronLeft, AlertCircle, Play,
    Tag, Globe, Calendar, Star, Users, Settings, Rocket,
    Zap, Clock, Check, RefreshCw,
} from 'lucide-react';

// Aliases for icons not available in lucide-react 0.344.0
const CloudUpload = Upload;
const CheckCheck  = Check;
const FileVideo   = Film;
const Settings2   = Settings;
const RotateCcw   = RefreshCw;
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/* ─────────────────────────────────────────────────────────── */

interface UploadFormProps {
    categories: any[];
    type?: 'VIDEO' | 'REEL';
}

type Step = 'FILE' | 'DETAILS' | 'PREVIEW';
type UploadStage = 'uploading' | 'processing' | 'success' | 'failed';

const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
const MAX_REEL_SIZE  = 500 * 1024 * 1024;       // 500 MB

/* ─────────────────────────────────────────────────────────── */

export default function UploadForm({ categories, type = 'REEL' }: UploadFormProps) {
    const router    = useRouter();
    const { data: session } = useSession();
    const abortRef  = useRef<XMLHttpRequest | null>(null);

    const isVideo = type === 'VIDEO';

    /* ── state ────────────────────────────────────────────── */
    const [currentStep, setCurrentStep]       = useState<Step>('FILE');
    const [isUploading,  setIsUploading]       = useState(false);
    const [uploadStage,  setUploadStage]       = useState<UploadStage>('uploading');
    const [uploadPct,    setUploadPct]         = useState(0);
    const [uploadedBytes, setUploadedBytes]    = useState(0);
    const [totalBytes,    setTotalBytes]       = useState(0);
    const [uploadSpeed,   setUploadSpeed]      = useState(0);
    const [timeLeft,      setTimeLeft]         = useState(0);
    const [error,         setError]            = useState<string | null>(null);
    const [fieldErrors,   setFieldErrors]      = useState<Record<string, string>>({});

    const [videoFile,       setVideoFile]      = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
    const [thumbnailFile,   setThumbnailFile]  = useState<File | null>(null);
    const [thumbPreviewUrl, setThumbPreviewUrl] = useState('');
    const [dragTarget, setDragTarget]          = useState<'video' | 'thumb' | null>(null);

    const [form, setForm] = useState({
        title:             '',
        description:       '',
        categoryId:        categories[0]?.id ?? '',
        language:          'Hindi',
        releaseYear:       new Date().getFullYear(),
        tags:              '',
        contentRating:     'U',
        videoQuality:      isVideo ? 'HD' : 'HD',
        director:          '',
        productionCompany: '',
        rating:            '',
        cast:              [] as string[],
        isFeatured:        false,
    });
    const [castInput, setCastInput] = useState('');

    /* ── cleanup object URLs ──────────────────────────────── */
    useEffect(() => {
        if (!videoFile) { setVideoPreviewUrl(''); return; }
        const url = URL.createObjectURL(videoFile);
        setVideoPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    /* ── helpers ──────────────────────────────────────────── */
    const fmt = (n: number) => {
        if (n === 0) return '0 B';
        const u = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(n) / Math.log(1024));
        return (n / Math.pow(1024, i)).toFixed(1) + ' ' + u[i];
    };

    const fmtTime = (s: number) => {
        if (!isFinite(s) || s <= 0) return '—';
        if (s < 60)  return `${Math.round(s)}s`;
        if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
        return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    };

    const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }));

    const validateFile = (file: File): string | null => {
        const max = isVideo ? MAX_VIDEO_SIZE : MAX_REEL_SIZE;
        if (file.size > max) return `File too large. Max ${isVideo ? '5 GB' : '500 MB'} allowed.`;
        if (!file.type.startsWith('video/')) return 'Please select a valid video file.';
        return null;
    };

    const pickVideo = useCallback((file: File) => {
        const err = validateFile(file);
        if (err) { setError(err); return; }
        setError(null);
        setVideoFile(file);
    }, [isVideo]); // eslint-disable-line

    const pickThumb = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
        setThumbnailFile(file);
        setThumbPreviewUrl(URL.createObjectURL(file));
    }, []);

    /* ── drag & drop ──────────────────────────────────────── */
    const onDrop = useCallback((e: React.DragEvent, zone: 'video' | 'thumb') => {
        e.preventDefault();
        setDragTarget(null);
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (zone === 'video') pickVideo(file);
        else pickThumb(file);
    }, [pickVideo, pickThumb]);

    /* ── validation ───────────────────────────────────────── */
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.title.trim())   errs.title      = 'Title is required';
        if (!form.categoryId)     errs.categoryId = 'Please select a category';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── XHR upload ───────────────────────────────────────── */
    const uploadWithProgress = (fd: FormData): Promise<any> =>
        new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            abortRef.current = xhr;

            let lastLoaded = 0;
            let lastTime   = Date.now();

            xhr.upload.addEventListener('progress', (e) => {
                if (!e.lengthComputable) return;
                const now       = Date.now();
                const timeDiff  = (now - lastTime) / 1000;
                const bytesDiff = e.loaded - lastLoaded;
                const speed     = timeDiff > 0 ? bytesDiff / timeDiff : 0;
                const pct       = Math.round((e.loaded / e.total) * 100);

                setUploadPct(pct);
                setUploadedBytes(e.loaded);
                setTotalBytes(e.total);
                setUploadSpeed(speed);
                setTimeLeft(speed > 0 ? (e.total - e.loaded) / speed : 0);

                // Switch to "processing" once all bytes are sent
                if (pct >= 100) setUploadStage('processing');

                lastLoaded = e.loaded;
                lastTime   = now;
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try { resolve(JSON.parse(xhr.responseText)); }
                    catch { resolve({ ok: true }); } // bare success
                } else {
                    try {
                        const body = JSON.parse(xhr.responseText);
                        reject(new Error(body.message || body.error || `Server error ${xhr.status}`));
                    } catch {
                        reject(new Error(`Server error ${xhr.status}`));
                    }
                }
            });

            xhr.addEventListener('error',  () => reject(new Error('Network error. Check your connection.')));
            xhr.addEventListener('abort',  () => reject(new Error('Upload cancelled.')));

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            xhr.open('POST', `${apiUrl}/videos`);
            // @ts-ignore
            const token = session?.accessToken;
            if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(fd);
        });

    /* ── submit ───────────────────────────────────────────── */
    const handleSubmit = async () => {
        if (!videoFile) { setError('Please select a video file.'); return; }
        if (!validate()) { setCurrentStep('DETAILS'); return; }

        setError(null);
        setIsUploading(true);
        setUploadStage('uploading');
        setUploadPct(0);

        try {
            const fd = new FormData();
            fd.append('video', videoFile);
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

            fd.append('title',          form.title.trim());
            fd.append('description',    form.description.trim() || form.title.trim());
            fd.append('category_id',    form.categoryId.toString());
            fd.append('type',           type);
            fd.append('language',       form.language);
            fd.append('content_rating', form.contentRating);
            fd.append('release_year',   form.releaseYear.toString());
            fd.append('is_active',      'true');
            fd.append('is_featured',    form.isFeatured ? 'true' : 'false');
            fd.append('is_trending',    'false');
            if (form.videoQuality)      fd.append('videoQuality',  form.videoQuality);
            if (form.director)          fd.append('director',       form.director);
            if (form.productionCompany) fd.append('productionCompany', form.productionCompany);
            if (form.rating)            fd.append('rating',         form.rating);
            if (form.cast.length > 0)   fd.append('cast',           JSON.stringify(form.cast));
            if (form.tags) {
                fd.append('tags', JSON.stringify(
                    form.tags.split(',').map(t => t.trim()).filter(Boolean)
                ));
            }

            const response = await uploadWithProgress(fd);

            // ── FIX: the root cause of "status failed" ──
            // XHR already validates 2xx before resolving, so any resolve = HTTP success.
            // Only treat as failure if the body explicitly says { success: false }.
            if (response?.success === false) {
                throw new Error(response.message || response.error || 'Upload rejected by server.');
            }

            // Show success screen, then navigate
            setUploadStage('success');
            setUploadPct(100);
            setTimeout(() => {
                router.push('/u/dashboard?tab=content');
            }, 2200);

        } catch (err: any) {
            if (err.message === 'Upload cancelled.') {
                setIsUploading(false);
                setUploadStage('uploading');
                return;
            }
            setUploadStage('failed');
            setError(err.message || 'Upload failed. Please try again.');
            // Keep overlay open so user sees the error clearly
        }
    };

    const handleCancel = () => {
        abortRef.current?.abort();
        setIsUploading(false);
        setUploadStage('uploading');
        setUploadPct(0);
        setError(null);
    };

    const handleRetry = () => {
        setUploadStage('uploading');
        setError(null);
        setIsUploading(false);
    };

    /* ── step guard ───────────────────────────────────────── */
    const goToDetails = () => {
        if (!videoFile) { setError('Please select a video file first.'); return; }
        setError(null);
        setCurrentStep('DETAILS');
    };

    const goToPreview = () => {
        if (!validate()) return;
        setCurrentStep('PREVIEW');
    };

    /* ─── RENDER ─────────────────────────────────────────── */
    return (
        <div className="space-y-8">

            {/* ── Step indicator ── */}
            <div className="flex items-center justify-center gap-2">
                {(['FILE', 'DETAILS', 'PREVIEW'] as Step[]).map((step, idx) => {
                    const labels  = ['File', 'Details', 'Review'];
                    const isDone  = ['FILE', 'DETAILS', 'PREVIEW'].indexOf(currentStep) > idx;
                    const isActive = currentStep === step;
                    return (
                        <div key={step} className="flex items-center gap-2">
                            <button
                                disabled={idx > ['FILE', 'DETAILS', 'PREVIEW'].indexOf(currentStep)}
                                onClick={() => setCurrentStep(step)}
                                className={`flex flex-col items-center gap-1.5 group transition-all disabled:cursor-not-allowed ${isActive ? 'opacity-100 scale-110' : isDone ? 'opacity-70 hover:opacity-100' : 'opacity-30'}`}
                            >
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all shadow-sm ${isActive ? 'bg-indigo-600 text-white shadow-indigo-600/30' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                    {isDone ? <CheckCheck className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.18em] ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                    {labels[idx]}
                                </span>
                            </button>
                            {idx < 2 && (
                                <div className={`w-14 h-[2px] mb-5 rounded-full transition-colors ${isDone ? 'bg-emerald-400' : 'bg-slate-100 dark:bg-white/5'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Error banner ── */}
            {error && !isUploading && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="flex-1 text-xs font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                UPLOAD OVERLAY  (uploading / processing / success / failed)
            ════════════════════════════════════════════════ */}
            {isUploading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-50/90 dark:bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 border border-slate-200 dark:border-white/10 shadow-2xl shadow-indigo-500/10 space-y-8 relative overflow-hidden">

                        {/* subtle glow */}
                        <div className={`absolute inset-0 -z-10 blur-[80px] rounded-full opacity-20 transition-colors duration-700 ${uploadStage === 'success' ? 'bg-emerald-400' : uploadStage === 'failed' ? 'bg-rose-400' : 'bg-indigo-400'}`} />

                        {/* icon area */}
                        <div className="text-center space-y-5">
                            {uploadStage === 'uploading' && (
                                <div className="w-20 h-20 rounded-[28px] bg-indigo-600/10 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
                                    <CloudUpload className="w-10 h-10" />
                                </div>
                            )}
                            {uploadStage === 'processing' && (
                                <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                                    <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                </div>
                            )}
                            {uploadStage === 'success' && (
                                <div className="w-20 h-20 rounded-[28px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                            )}
                            {uploadStage === 'failed' && (
                                <div className="w-20 h-20 rounded-[28px] bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto animate-in zoom-in-50 duration-300">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                            )}

                            <div>
                                {uploadStage === 'uploading' && (
                                    <>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Uploading…</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Keep this tab open</p>
                                    </>
                                )}
                                {uploadStage === 'processing' && (
                                    <>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Processing on Server</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Almost there — please wait…</p>
                                    </>
                                )}
                                {uploadStage === 'success' && (
                                    <>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Published!</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Redirecting to your studio…</p>
                                    </>
                                )}
                                {uploadStage === 'failed' && (
                                    <>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-rose-500">Upload Failed</h2>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">{error}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* progress bar (only during uploading) */}
                        {(uploadStage === 'uploading') && (
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 relative"
                                        style={{ width: `${uploadPct}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="text-indigo-600 dark:text-indigo-400">{uploadPct}%</span>
                                    <span>{fmt(uploadedBytes)} / {fmt(totalBytes)}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(timeLeft)}</span>
                                </div>
                                {uploadSpeed > 0 && (
                                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Zap className="w-3 h-3 inline mr-1 text-amber-400" />{fmt(uploadSpeed)}/s
                                    </p>
                                )}
                            </div>
                        )}

                        {/* processing pulsing bar */}
                        {uploadStage === 'processing' && (
                            <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                            </div>
                        )}

                        {/* success progress */}
                        {uploadStage === 'success' && (
                            <div className="h-2 w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full w-full animate-in slide-in-from-left-full duration-1000" />
                            </div>
                        )}

                        {/* action buttons */}
                        {uploadStage === 'uploading' && (
                            <button
                                onClick={handleCancel}
                                className="w-full py-3.5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-rose-500/20 hover:border-rose-500/40"
                            >
                                Cancel Upload
                            </button>
                        )}
                        {uploadStage === 'failed' && (
                            <div className="flex gap-3">
                                <button onClick={handleRetry} className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2">
                                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                                </button>
                                <button onClick={handleSubmit} className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                    <Upload className="w-3.5 h-3.5" /> Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                STEP 1 — FILE
            ════════════════════════════════════════════════ */}
            {currentStep === 'FILE' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Choose Your Files</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isVideo ? 'Max 5 GB · MP4, MKV, MOV' : 'Max 500 MB · MP4, MOV'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ── Video drop zone ── */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragTarget('video'); }}
                            onDragLeave={() => setDragTarget(null)}
                            onDrop={(e) => onDrop(e, 'video')}
                            className={`relative border-2 border-dashed rounded-[32px] p-8 text-center transition-all duration-300 group overflow-hidden cursor-pointer ${videoFile
                                ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
                                : dragTarget === 'video'
                                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.02]'
                                    : 'border-slate-200 dark:border-white/10 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => e.target.files?.[0] && pickVideo(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="pointer-events-none space-y-4">
                                <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto transition-all duration-300 ${videoFile ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:scale-110 group-hover:text-indigo-500'}`}>
                                    <Film className="w-8 h-8" />
                                </div>
                                {videoFile ? (
                                    <div>
                                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest truncate px-2">{videoFile.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{fmt(videoFile.size)}</p>
                                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Ready
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                            {dragTarget === 'video' ? 'Drop it here!' : 'Drop or click to select'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                            {isVideo ? 'MP4 · MKV · MOV · AVI' : 'MP4 · MOV · WEBM'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Thumbnail drop zone ── */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragTarget('thumb'); }}
                            onDragLeave={() => setDragTarget(null)}
                            onDrop={(e) => onDrop(e, 'thumb')}
                            className={`relative border-2 border-dashed rounded-[32px] overflow-hidden text-center transition-all duration-300 group cursor-pointer ${thumbPreviewUrl
                                ? 'border-emerald-500 bg-emerald-500/5'
                                : dragTarget === 'thumb'
                                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.02]'
                                    : 'border-slate-200 dark:border-white/10 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && pickThumb(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            {thumbPreviewUrl ? (
                                <>
                                    <Image src={thumbPreviewUrl} alt="Thumbnail" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Change Image</span>
                                    </div>
                                    <div className="absolute top-3 right-3 z-20">
                                        <div className="px-2 py-1 bg-emerald-500/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-sm flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> Set
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 space-y-4 pointer-events-none">
                                    <div className={`w-16 h-16 rounded-[20px] bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:text-indigo-500 transition-all duration-300 ${dragTarget === 'thumb' ? 'scale-110 text-indigo-500' : ''}`}>
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                            {dragTarget === 'thumb' ? 'Drop artwork here!' : 'Cover Image'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">JPG · PNG · WEBP · Recommended</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video mini-preview */}
                    {videoPreviewUrl && (
                        <div className="bg-black rounded-[24px] overflow-hidden aspect-video relative shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest rounded-lg backdrop-blur-sm flex items-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-white" /> Local Preview
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={goToDetails}
                            disabled={!videoFile}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                        >
                            Continue <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                STEP 2 — DETAILS
            ════════════════════════════════════════════════ */}
            {currentStep === 'DETAILS' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                    <div className="text-center">
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Content Details</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Help people find your {isVideo ? 'video' : 'reel'}</p>
                    </div>

                    {/* ── Core fields ── */}
                    <div className="space-y-5">
                        {/* Title + Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    <FileVideo className="w-3 h-3" /> Title *
                                </label>
                                <input
                                    value={form.title}
                                    onChange={(e) => { set('title', e.target.value); setFieldErrors(p => ({ ...p, title: '' })); }}
                                    placeholder={isVideo ? "What's your film called?" : "Reel title…"}
                                    className={`w-full px-5 py-4 bg-white/60 dark:bg-black/40 border rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold ${fieldErrors.title ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-200 dark:border-white/10'}`}
                                />
                                {fieldErrors.title && <p className="text-[10px] text-rose-500 font-bold pl-1">{fieldErrors.title}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    <Tag className="w-3 h-3" /> Category *
                                </label>
                                <select
                                    value={form.categoryId}
                                    onChange={(e) => { set('categoryId', e.target.value); setFieldErrors(p => ({ ...p, categoryId: '' })); }}
                                    className={`w-full px-5 py-4 bg-white/60 dark:bg-black/40 border rounded-2xl outline-none text-sm font-bold cursor-pointer focus:ring-2 focus:ring-indigo-600 ${fieldErrors.categoryId ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-200 dark:border-white/10'}`}
                                >
                                    <option value="">— Select a category —</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>
                                    ))}
                                </select>
                                {fieldErrors.categoryId && <p className="text-[10px] text-rose-500 font-bold pl-1">{fieldErrors.categoryId}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                rows={3}
                                placeholder="Describe your content in a few sentences…"
                                className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium leading-relaxed resize-none"
                            />
                        </div>

                        {/* Year + Language */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    <Calendar className="w-3 h-3" /> Release Year
                                </label>
                                <input
                                    type="number" min="1900" max="2099"
                                    value={form.releaseYear}
                                    onChange={(e) => set('releaseYear', parseInt(e.target.value))}
                                    className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    <Globe className="w-3 h-3" /> Language
                                </label>
                                <select
                                    value={form.language}
                                    onChange={(e) => set('language', e.target.value)}
                                    className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none text-sm font-bold cursor-pointer focus:ring-2 focus:ring-indigo-600"
                                >
                                    {['Hindi', 'English', 'Maithili', 'Bhojpuri', 'Tamil', 'Other'].map(l => (
                                        <option key={l} value={l} className="dark:bg-slate-900">{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                <Tag className="w-3 h-3" /> Tags
                            </label>
                            <input
                                value={form.tags}
                                onChange={(e) => set('tags', e.target.value)}
                                placeholder="Comedy, Short Film, 2024 (comma separated)"
                                className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
                            />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter pl-1">Improves search & recommendations</p>
                        </div>
                    </div>

                    {/* ── Advanced: Cast & Production (collapsible feel via border-top) ── */}
                    {isVideo && (
                        <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-5">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Cast & Production</h4>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-auto">Optional</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Director</label>
                                    <input value={form.director} onChange={(e) => set('director', e.target.value)} className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Production Co.</label>
                                    <input value={form.productionCompany} onChange={(e) => set('productionCompany', e.target.value)} className="w-full px-5 py-4 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold" />
                                </div>
                            </div>

                            {/* Cast chips */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cast Members</label>
                                <div className="flex gap-2">
                                    <input
                                        value={castInput}
                                        onChange={(e) => setCastInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && castInput.trim()) {
                                                e.preventDefault();
                                                set('cast', [...form.cast, castInput.trim()]);
                                                setCastInput('');
                                            }
                                        }}
                                        placeholder="Actor name, press Enter"
                                        className="flex-1 px-5 py-3.5 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-bold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (castInput.trim()) { set('cast', [...form.cast, castInput.trim()]); setCastInput(''); } }}
                                        className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                {form.cast.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {form.cast.map((actor, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wide border border-indigo-100 dark:border-indigo-500/20">
                                                {actor}
                                                <button onClick={() => set('cast', form.cast.filter((_, j) => j !== i))} className="hover:text-rose-500 transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Technical ── */}
                    <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Technical</h4>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-auto">Optional</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quality</label>
                                <select value={form.videoQuality} onChange={(e) => set('videoQuality', e.target.value)} className="w-full px-4 py-3.5 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold cursor-pointer focus:ring-2 focus:ring-indigo-600">
                                    {['SD', 'HD', 'FHD', '4K', '8K'].map(q => <option key={q} value={q} className="dark:bg-slate-900">{q}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rating</label>
                                <select value={form.contentRating} onChange={(e) => set('contentRating', e.target.value)} className="w-full px-4 py-3.5 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold cursor-pointer focus:ring-2 focus:ring-indigo-600">
                                    {['U', 'UA', 'A', 'S'].map(r => <option key={r} value={r} className="dark:bg-slate-900">{r}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                    <Star className="w-3 h-3 text-amber-400" /> Score
                                </label>
                                <input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} placeholder="0–10" className="w-full px-4 py-3.5 bg-white/60 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setCurrentStep('FILE')} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                            onClick={goToPreview}
                            className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-3 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                            Review <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                STEP 3 — PREVIEW / REVIEW
            ════════════════════════════════════════════════ */}
            {currentStep === 'PREVIEW' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center">
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Review & Publish</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Double-check before going live</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Preview column */}
                        <div className="md:col-span-7 space-y-5">
                            <div className="aspect-video bg-black rounded-[28px] overflow-hidden relative shadow-2xl border border-white/10">
                                {videoPreviewUrl
                                    ? <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                                    : <div className="flex items-center justify-center h-full text-white/40 font-black uppercase tracking-widest text-[10px]">No preview</div>
                                }
                            </div>

                            {/* Thumbnail strip */}
                            {thumbPreviewUrl && (
                                <div className="relative h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                                    <Image src={thumbPreviewUrl} alt="Cover" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center px-4">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" /> Cover art set
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Checklist */}
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-2">
                                {[
                                    { label: 'Video file selected', ok: !!videoFile },
                                    { label: 'Title entered', ok: !!form.title.trim() },
                                    { label: 'Category selected', ok: !!form.categoryId },
                                    { label: 'Cover image attached', ok: !!thumbnailFile, warn: true },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-500/20 text-emerald-500' : item.warn ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                            {item.ok
                                                ? <CheckCheck className="w-3 h-3" />
                                                : item.warn ? <AlertCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${item.ok ? 'text-slate-600 dark:text-slate-300' : item.warn ? 'text-amber-500' : 'text-rose-500'}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Meta column */}
                        <div className="md:col-span-5 flex flex-col gap-6">
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[28px] p-6 border border-slate-200/60 dark:border-white/10 space-y-5 flex-1">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Title</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight line-clamp-3">{form.title || '—'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2 border-t border-slate-200 dark:border-white/5">
                                    {[
                                        { label: 'Category',  value: categories.find(c => c.id == form.categoryId)?.name || '—' },
                                        { label: 'Language',  value: form.language },
                                        { label: 'Year',      value: form.releaseYear },
                                        { label: 'Quality',   value: form.videoQuality },
                                        { label: 'Rating',    value: form.contentRating },
                                        { label: 'Size',      value: fmt(videoFile?.size || 0) },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase mt-0.5">{String(value)}</p>
                                        </div>
                                    ))}
                                </div>

                                {form.cast.length > 0 && (
                                    <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cast</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {form.cast.map((a, i) => (
                                                <span key={i} className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-white/5">{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {form.description && (
                                    <div className="pt-3 border-t border-slate-200 dark:border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4 italic">&ldquo;{form.description}&rdquo;</p>
                                    </div>
                                )}
                            </div>

                            {/* Publish button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.35em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                                <Rocket className="w-5 h-5" />
                                Publish {isVideo ? 'Video' : 'Reel'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setCurrentStep('DETAILS')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all underline underline-offset-4 decoration-slate-300 dark:decoration-white/20"
                    >
                        <ChevronLeft className="w-4 h-4" /> Edit Details
                    </button>
                </div>
            )}
        </div>
    );
}
