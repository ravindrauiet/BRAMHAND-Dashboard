'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updatePreferences } from '@/app/actions/user';
import { Loader2, CheckCircle2, AlertCircle, Save, Bell, Monitor, Globe, Camera, User } from 'lucide-react';

interface SettingsFormProps {
    user: any;
}

export default function SettingsForm({ user }: SettingsFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(user.profileImage);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        content_language: user.preferences?.content_language || 'Hindi',
        app_language: user.preferences?.app_language || 'English',
        notification_enabled: user.preferences?.notification_enabled ?? true,
        auto_play: user.preferences?.auto_play ?? true,
        video_quality: user.preferences?.video_quality || 'Auto'
    });

    const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
            setUploadError('Please select a valid image file (JPG, PNG, or WebP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            // @ts-ignore - accessToken is custom property
            const token = session?.accessToken;

            const response = await fetch(`${apiUrl}/users/profile/image`, {
                method: 'PUT',
                body: formData,
                credentials: 'include',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });

            const data = await response.json();

            if (data.success) {
                setProfileImage(data.profileImage);
                setStatus({ type: 'success', message: 'Profile picture updated!' });
                setTimeout(() => setStatus(null), 3000);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Refresh to update navbar image
                router.refresh();
            } else {
                setUploadError(data.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        const res = await updatePreferences(formData);

        if (res.success) {
            setStatus({ type: 'success', message: 'Preferences updated successfully!' });
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus({ type: 'error', message: res.error || 'Something went wrong' });
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-xs font-black uppercase tracking-widest">{status.message}</p>
                </div>
            )}

            {/* Profile Picture Section */}
            <div className="pb-10 border-b border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                        <Camera className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Profile Picture</h3>
                </div>

                <div className="flex items-center gap-6">
                    <div
                        className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 cursor-pointer group ring-4 ring-white dark:ring-white/10 shadow-xl"
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    >
                        {profileImage ? (
                            <Image src={profileImage} alt="Profile" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <User className="w-10 h-10" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUploadingImage ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                                <Camera className="w-6 h-6 text-white" />
                            )}
                        </div>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                            disabled={isUploadingImage}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-5 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-2 border border-slate-200 dark:border-white/10"
                        >
                            {isUploadingImage ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    Change Photo
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">JPG, PNG or WebP. Max 5MB.</p>
                        {uploadError && (
                            <p className="text-[10px] text-rose-500 mt-1 font-bold">{uploadError}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Visual Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                            <Monitor className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Viewing Experience</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Playback Quality</label>
                            <select
                                value={formData.video_quality}
                                onChange={(e) => setFormData({ ...formData, video_quality: e.target.value })}
                                className="w-full px-5 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl outline-none font-bold text-sm"
                            >
                                <option value="Auto">Auto (Recommended)</option>
                                <option value="1080p">High Definition (1080p)</option>
                                <option value="720p">Standard (720p)</option>
                                <option value="480p">Data Saver (480p)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-tight">Auto-play Videos</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Start videos as you scroll</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.auto_play}
                                onChange={(e) => setFormData({ ...formData, auto_play: e.target.checked })}
                                className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-600 border-slate-300 dark:border-white/10 dark:bg-black/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Globe className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Localization</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Content Language</label>
                            <select
                                value={formData.content_language}
                                onChange={(e) => setFormData({ ...formData, content_language: e.target.value })}
                                className="w-full px-5 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl outline-none font-bold text-sm"
                            >
                                <option value="Hindi">Hindi (Default)</option>
                                <option value="English">English</option>
                                <option value="Bhojpuri">Bhojpuri</option>
                                <option value="Maithili">Maithili</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight">In-App Notifications</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Stay updated with new releases</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.notification_enabled}
                                onChange={(e) => setFormData({ ...formData, notification_enabled: e.target.checked })}
                                className="w-6 h-6 rounded-lg text-amber-600 focus:ring-amber-600 border-slate-300 dark:border-white/10 dark:bg-black/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-200/50 dark:border-white/5 flex justify-end">
                <button
                    disabled={isLoading}
                    className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? 'Syncing...' : 'Save Preferences'}
                </button>
            </div>
        </form>
    );
}
