'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, Video, Music, Heart, Clock, Settings, Shield, Wallet, Film, Calendar, Mail, Phone, MapPin, BadgeCheck, Zap, Activity, List, Grid } from 'lucide-react';
import { updateUser } from './actions';

interface UserDetailsProps {
    user: any; // Using any for flexibility with the complex Prisma include, in a strict app we'd define types
}

export function UserDetails({ user }: UserDetailsProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const createdDate = new Date(user.createdAt).toLocaleDateString('en-GB');

    // Tab Navigation
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'content', label: 'Content', icon: Film },
        { id: 'activity', label: 'Activity', icon: Clock },
        { id: 'financials', label: 'Financials', icon: Wallet },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // Filter tabs based on user type (e.g. only creators need financials/content focus)
    const visibleTabs = user.isCreator
        ? tabs
        : tabs.filter(t => t.id !== 'financials');

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-2xl bg-white dark:bg-slate-800">
                                {user.profileImage ? (
                                    <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {user.fullName}
                                    {user.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10" />}
                                </h1>
                                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 mt-1">
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Calendar className="w-4 h-4" /> Joined {createdDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                            {user.isCreator && (
                                <span className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 font-semibold flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Creator Account
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation Menu */}
                    <div className="flex gap-1 border-b border-gray-200 dark:border-slate-800">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 text-sm font-medium rounded-t-xl transition-all flex items-center gap-2 relative ${activeTab === tab.id
                                    ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 dark:text-blue-400 border-b-2 border-blue-600'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <StatsCard icon={Film} label="Videos" value={user._count?.videos || 0} color="blue" />
                                <StatsCard icon={Heart} label="Likes" value={(user._count?.songLikes || 0) + (user._count?.videoLikes || 0)} color="rose" />
                                <StatsCard icon={List} label="Playlists" value={user._count?.playlists || 0} color="emerald" />
                            </div>

                            {/* Recent Activity Preview */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {(user.videoViews || []).slice(0, 3).map((view: any) => (
                                        <div key={view.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="relative w-20 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                {view.video.thumbnailUrl && <Image src={view.video.thumbnailUrl} alt="" fill className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">Watched "{view.video.title}"</p>
                                                <p className="text-xs text-slate-500">{new Date(view.createdAt).toLocaleDateString('en-GB')}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!user.videoViews || user.videoViews.length === 0) && <p className="text-slate-500 text-sm">No recent activity.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTENT TAB */}
                    {activeTab === 'content' && (
                        <div className="glass-card p-6 rounded-2xl animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Uploaded Content</h3>
                            <div className="space-y-4">
                                {user.videos && user.videos.length > 0 ? (
                                    user.videos.map((video: any) => (
                                        <div key={video.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{video.title}</p>
                                                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                        <span>{video.viewsCount} views</span>
                                                        <span>•</span>
                                                        <span>{video.likesCount} likes</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-semibold ${video.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700'}`}>
                                                {video.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No videos uploaded yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACTIVITY TAB */}
                    {activeTab === 'activity' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Watch History */}
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-500" /> Watch History
                                </h3>
                                <div className="space-y-4">
                                    {(user.videoViews || []).map((view: any) => (
                                        <div key={view.id} className="flex gap-4 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                            <div className="relative w-24 h-14 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden flex-shrink-0">
                                                {view.video?.thumbnailUrl && <Image src={view.video.thumbnailUrl} alt="" fill className="object-cover" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{view.video?.title || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">{new Date(view.createdAt).toLocaleDateString('en-GB')} • {new Date(view.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!user.videoViews || user.videoViews.length === 0) && <p className="text-slate-500 text-sm italic">No watch history found.</p>}
                                </div>
                            </div>

                            {/* Liked Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Liked Videos */}
                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-rose-500" /> Liked Videos
                                    </h3>
                                    <div className="space-y-3">
                                        {(user.videoLikes || []).map((like: any) => (
                                            <div key={like.id} className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    {like.video.thumbnailUrl && <Image src={like.video.thumbnailUrl} alt="" fill className="object-cover" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{like.video.title}</p>
                                                    <p className="text-xs text-slate-500">{new Date(like.createdAt).toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!user.videoLikes || user.videoLikes.length === 0) && <p className="text-slate-500 text-sm italic">No liked videos.</p>}
                                    </div>
                                </div>

                                {/* Liked Songs */}
                                <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Music className="w-5 h-5 text-purple-500" /> Liked Songs
                                    </h3>
                                    <div className="space-y-3">
                                        {(user.songLikes || []).map((like: any) => (
                                            <div key={like.id} className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    {like.song.coverUrl ? (
                                                        <Image src={like.song.coverUrl} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-500"><Music className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{like.song.title}</p>
                                                    <p className="text-xs text-slate-500">{like.song.artist}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!user.songLikes || user.songLikes.length === 0) && <p className="text-slate-500 text-sm italic">No liked songs.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FINANCIALS TAB */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {user.creatorProfile ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                                            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide mb-2">Total Earnings</p>
                                            <h3 className="text-4xl font-bold">₹{user.creatorProfile.totalEarnings.toString()}</h3>
                                            <div className="mt-6 flex items-center gap-2 text-emerald-50 bg-white/20 w-fit px-3 py-1 rounded-full text-xs backdrop-blur-md border border-white/10">
                                                <div className={`w-2 h-2 rounded-full ${user.creatorProfile.isMonetizationEnabled ? 'bg-emerald-300 animate-pulse' : 'bg-red-300'}`}></div>
                                                {user.creatorProfile.isMonetizationEnabled ? 'Monetization Active' : 'Monetization Disabled'}
                                            </div>
                                        </div>

                                        <div className="glass-card p-6 rounded-2xl">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                                <Wallet className="w-5 h-5 text-slate-400" /> Banking Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bank Name</p>
                                                    <p className="font-medium text-slate-900 dark:text-white text-lg">{user.creatorProfile.bankName || 'Not provided'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                                                        <p className="font-medium text-slate-900 dark:text-white font-mono">
                                                            {user.creatorProfile.bankAccountNumber ? `•••• •••• ${user.creatorProfile.bankAccountNumber.slice(-4)}` : 'Not provided'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">IFSC Code</p>
                                                        <p className="font-medium text-slate-900 dark:text-white font-mono">{user.creatorProfile.ifscCode || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-500 glass-card rounded-2xl">
                                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>This user does not have a creator profile.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="glass-card p-8 rounded-2xl animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-slate-400" />
                                Edit Profile
                            </h2>
                            <form action={updateUser.bind(null, user.id)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                        <input
                                            name="fullName"
                                            defaultValue={user.fullName}
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                        <input
                                            name="email"
                                            defaultValue={user.email || ''}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
                                    <input
                                        name="mobileNumber"
                                        defaultValue={user.mobileNumber || ''}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-center space-x-8 pt-4">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="isCreator" defaultChecked={user.isCreator} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">Creator Status</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative">
                                            <input type="checkbox" name="isVerified" defaultChecked={user.isVerified} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Verified Status</span>
                                    </label>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 font-medium">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* User Preferences */}
                    {user.preferences && (
                        <div className="glass-card p-6 rounded-2xl">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Preferences</h3>
                            <div className="space-y-3">
                                <PreferenceRow label="Content Language" value={user.preferences.contentLanguage} />
                                <PreferenceRow label="App Language" value={user.preferences.appLanguage} />
                                <PreferenceRow label="Video Quality" value={user.preferences.videoQuality} />
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Notifications</span>
                                    <span className={user.preferences.notificationEnabled ? 'text-emerald-500' : 'text-slate-400'}>
                                        {user.preferences.notificationEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Mini-Summary (if Creator) */}
                    {user.isCreator && user.creatorProfile && (
                        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Earnings
                            </h3>
                            <div className="text-3xl font-bold mb-1">
                                ₹{user.creatorProfile.totalEarnings.toString()}
                            </div>
                            <p className="text-xs text-slate-400 mb-4">Total Lifetime Earnings</p>
                            <div className="flex items-center gap-2 text-xs bg-white/10 p-2 rounded-lg">
                                <div className={`w-2 h-2 rounded-full ${user.creatorProfile.isMonetizationEnabled ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                {user.creatorProfile.isMonetizationEnabled ? 'Monetization Active' : 'Monetization Paused'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsCard({ icon: Icon, label, value, color }: any) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    }[color as string] || 'bg-slate-50 text-slate-600';

    return (
        <div className="glass-card p-4 rounded-xl flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${colorStyles}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}

function PreferenceRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-medium text-slate-900 dark:text-white">{value}</span>
        </div>
    );
}
