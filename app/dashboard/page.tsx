import { fetchFromApi } from '@/lib/api';
import {
  Users, Video, Music, PlayCircle, TrendingUp, Wallet, Bell, ArrowRight,
  Heart, MessageCircle, Film, Radio, Star, Globe, BarChart2, Headphones,
  UserCheck, AlertCircle, CheckCircle, Send, Smartphone, Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SparkLine from '@/components/SparkLine';
import MiniBar from '@/components/MiniBar';

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function growthPct(current: number, prev: number): string {
  if (prev === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - prev) / prev) * 100;
  return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
}

function GrowthBadge({ current, prev }: { current: number; prev: number }) {
  const isUp = current >= prev;
  const label = growthPct(current, prev);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
      {isUp ? '▲' : '▼'} {label}
    </span>
  );
}

function SectionHeading({ icon: Icon, title, sub, href }: { icon: any; title: string; sub?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" /></div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const data = await fetchFromApi('/admin/stats');

  if (!data.success) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const {
    userCount, videoCount, reelCount, songCount, creatorCount,
    totalViews, totalLikes, totalComments, totalEarnings, totalSongPlays, totalSongLikes,
    newUsersThisWeek, prevUsersLastWeek, newVideosThisWeek, newSongsThisWeek,
    userGrowth, videoGrowth, viewsGrowth,
    contentTypes, videoGenres, musicGenres, languageDist,
    topVideos, topSongs, topCreators,
    recentUsers, recentVideos, recentSongs,
    support, notifications,
  } = data;

  // Build sparkline arrays from time-series data
  const userSparkData: number[] = (() => {
    const map: Record<string, number> = {};
    (userGrowth || []).forEach((r: any) => { map[r.date] = r.count; });
    const days: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(map[key] || 0);
    }
    return days;
  })();

  const videoSparkData: number[] = (() => {
    const map: Record<string, number> = {};
    (videoGrowth || []).forEach((r: any) => { map[r.date] = r.count; });
    const days: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(map[key] || 0);
    }
    return days;
  })();

  const viewsSparkData: number[] = (() => {
    const map: Record<string, number> = {};
    (viewsGrowth || []).forEach((r: any) => { map[r.date] = r.count; });
    const days: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(map[key] || 0);
    }
    return days;
  })();

  const notifReadRate = notifications?.total > 0
    ? Math.round((notifications.read / notifications.total) * 100)
    : 0;

  const supportResolveRate = support?.total > 0
    ? Math.round((support.resolved / support.total) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-10">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Complete platform overview — all metrics in one place</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/notifications"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Bell className="w-4 h-4" /> Send Announcement
          </Link>
          <Link href="/dashboard/support"
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <AlertCircle className="w-4 h-4" /> Support ({support?.pending || 0} pending)
          </Link>
        </div>
      </div>

      {/* ── Row 1: 8 Core Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',     value: userCount,      icon: Users,       color: 'blue',   link: '/dashboard/users',    badge: <GrowthBadge current={newUsersThisWeek} prev={prevUsersLastWeek} />, spark: userSparkData,  sparkColor: '#3b82f6' },
          { label: 'Videos',          value: videoCount,     icon: Video,       color: 'pink',   link: '/dashboard/videos',   badge: <span className="text-xs text-slate-400">+{newVideosThisWeek} this wk</span>, spark: videoSparkData, sparkColor: '#ec4899' },
          { label: 'Reels',           value: reelCount,      icon: Film,        color: 'rose',   link: '/dashboard/reels',    badge: null, spark: null, sparkColor: '#f43f5e' },
          { label: 'Songs',           value: songCount,      icon: Music,       color: 'purple', link: '/dashboard/songs',    badge: <span className="text-xs text-slate-400">+{newSongsThisWeek} this wk</span>, spark: null, sparkColor: '#8b5cf6' },
          { label: 'Total Views',     value: totalViews,     icon: Eye,         color: 'orange', link: '/dashboard/videos',   badge: null, spark: viewsSparkData, sparkColor: '#f59e0b' },
          { label: 'Total Likes',     value: totalLikes,     icon: Heart,       color: 'red',    link: '/dashboard/videos',   badge: null, spark: null, sparkColor: '#ef4444' },
          { label: 'Comments',        value: totalComments,  icon: MessageCircle,color:'teal',   link: '/dashboard/videos',   badge: null, spark: null, sparkColor: '#14b8a6' },
          { label: 'Creators',        value: creatorCount,   icon: UserCheck,   color: 'indigo', link: '/dashboard/creators', badge: null, spark: null, sparkColor: '#6366f1' },
        ].map((stat) => {
          const Icon = stat.icon;
          const gradMap: Record<string, string> = {
            blue: 'from-blue-500 to-cyan-400', pink: 'from-pink-500 to-rose-400',
            purple: 'from-purple-500 to-indigo-400', orange: 'from-orange-500 to-amber-400',
            red: 'from-red-500 to-rose-400', teal: 'from-teal-500 to-cyan-400',
            indigo: 'from-indigo-500 to-blue-400', rose: 'from-rose-500 to-pink-400',
          };
          const grad = gradMap[stat.color] || 'from-blue-500 to-cyan-400';
          return (
            <Link key={stat.label} href={stat.link}
              className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{fmt(stat.value || 0)}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${grad} shadow-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {stat.badge && <div className="mb-2">{stat.badge}</div>}
              {stat.spark && stat.spark.length > 1 && (
                <div className="mt-2 opacity-70">
                  <SparkLine data={stat.spark} color={stat.sparkColor} height={32} width={100} />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Row 2: Music Stats + Financial + Notifications ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Song Plays */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg"><Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Music Engagement</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fmt(totalSongPlays || 0)}</p>
              <p className="text-xs text-slate-500">total plays</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div><p className="text-xs text-slate-400">Song Likes</p><p className="font-bold text-slate-900 dark:text-white">{fmt(totalSongLikes || 0)}</p></div>
            <div><p className="text-xs text-slate-400">Total Songs</p><p className="font-bold text-slate-900 dark:text-white">{fmt(songCount || 0)}</p></div>
          </div>
        </div>

        {/* Creator Earnings */}
        <Link href="/dashboard/creators" className="glass-card p-5 rounded-2xl hover:border-indigo-500/30 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg"><Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Creator Earnings</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">₹{fmt(totalEarnings || 0)}</p>
              <p className="text-xs text-slate-500">total payouts generated</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div><p className="text-xs text-slate-400">Active Creators</p><p className="font-bold text-slate-900 dark:text-white">{creatorCount}</p></div>
            <div><p className="text-xs text-slate-400">Avg. Earning</p><p className="font-bold text-slate-900 dark:text-white">₹{creatorCount > 0 ? fmt(Math.round((totalEarnings || 0) / creatorCount)) : 0}</p></div>
          </div>
        </Link>

        {/* Notifications */}
        <Link href="/dashboard/notifications" className="glass-card p-5 rounded-2xl hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg"><Send className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Notifications</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fmt(notifications?.total || 0)}</p>
              <p className="text-xs text-slate-500">total sent</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Read rate</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{notifReadRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${notifReadRate}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5"><Smartphone className="w-3 h-3 text-slate-400" /><p className="text-xs text-slate-500">FCM Devices</p><p className="text-xs font-bold text-slate-900 dark:text-white ml-auto">{notifications?.fcmUsers || 0}</p></div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-emerald-400" /><p className="text-xs text-slate-500">Read</p><p className="text-xs font-bold text-slate-900 dark:text-white ml-auto">{notifications?.read || 0}</p></div>
          </div>
        </Link>
      </div>

      {/* ── Row 3: Top Videos + Top Songs (side by side tables) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Top Videos */}
        <div className="glass-card p-6 rounded-2xl">
          <SectionHeading icon={TrendingUp} title="Top Videos by Views" sub="All time performance" href="/dashboard/videos" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-left">#</th>
                  <th className="pb-3 text-left">Title</th>
                  <th className="pb-3 text-right">Views</th>
                  <th className="pb-3 text-right">Likes</th>
                  <th className="pb-3 text-right">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {(topVideos || []).slice(0, 10).map((v: any, i: number) => (
                  <tr key={v.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-2 text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="py-2.5 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-7 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                          {v.thumbnailUrl && <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white truncate max-w-[140px]">{v.title}</p>
                          <p className="text-xs text-slate-400 truncate">{v.creatorName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">{fmt(v.views)}</td>
                    <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">{fmt(v.likes)}</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${v.type === 'REEL' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
                        {v.type === 'REEL' ? 'Reel' : 'Video'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Songs */}
        <div className="glass-card p-6 rounded-2xl">
          <SectionHeading icon={Radio} title="Top Songs by Plays" sub="All time performance" href="/dashboard/songs" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 text-left">#</th>
                  <th className="pb-3 text-left">Song</th>
                  <th className="pb-3 text-right">Plays</th>
                  <th className="pb-3 text-right">Likes</th>
                  <th className="pb-3 text-right">Genre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {(topSongs || []).slice(0, 10).map((s: any, i: number) => (
                  <tr key={s.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 pr-2 text-slate-400 font-mono text-xs">{i + 1}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                          {s.coverImageUrl && <Image src={s.coverImageUrl} alt={s.title} fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white truncate max-w-[140px]">{s.title}</p>
                          <p className="text-xs text-slate-400 truncate">{s.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">{fmt(s.plays)}</td>
                    <td className="py-2.5 text-right text-slate-500">{fmt(s.likes)}</td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-medium">
                        {s.genre || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Row 4: Top Creators ── */}
      <div className="glass-card p-6 rounded-2xl">
        <SectionHeading icon={Star} title="Top Creators" sub="Ranked by total video views" href="/dashboard/creators" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="pb-3 text-left pl-2">#</th>
                <th className="pb-3 text-left">Creator</th>
                <th className="pb-3 text-right">Total Views</th>
                <th className="pb-3 text-right">Videos</th>
                <th className="pb-3 text-right">Subscribers</th>
                <th className="pb-3 text-right">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {(topCreators || []).slice(0, 10).map((c: any, i: number) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pl-2 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                        {c.avatar
                          ? <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">{c.name?.[0]}</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">{fmt(c.totalViews)}</td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-300">{c.videoCount}</td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-300">{fmt(c.subscribers)}</td>
                  <td className="py-3 text-right">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{fmt(c.earnings)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 5: Content Type, Genre, Language Distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Content Type Breakdown */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={BarChart2} title="Content Mix" />
          <div className="space-y-3">
            {(contentTypes || []).map((ct: any) => {
              const total = (contentTypes || []).reduce((s: number, c: any) => s + c.count, 0);
              const pct = total > 0 ? Math.round((ct.count / total) * 100) : 0;
              const colorMap: Record<string, string> = { VIDEO: 'bg-blue-500', REEL: 'bg-rose-500', SERIES: 'bg-indigo-500' };
              return (
                <div key={ct.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{ct.type}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{ct.count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-full rounded-full ${colorMap[ct.type] || 'bg-slate-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!contentTypes || contentTypes.length === 0) && <p className="text-slate-400 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Video Genres */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Film} title="Video Genres" />
          {videoGenres && videoGenres.length > 0 ? (
            <>
              <div className="mb-3">
                <MiniBar data={videoGenres.map((g: any) => ({ label: g.name, count: g.count }))} color="#3b82f6" height={60} />
              </div>
              <div className="space-y-2">
                {videoGenres.slice(0, 5).map((g: any) => {
                  const max = videoGenres[0]?.count || 1;
                  return (
                    <div key={g.name} className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300 w-20 truncate">{g.name}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(g.count / max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{g.count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <p className="text-slate-400 text-sm">No genre data</p>}
        </div>

        {/* Music Genres */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Music} title="Music Genres" />
          {musicGenres && musicGenres.length > 0 ? (
            <>
              <div className="mb-3">
                <MiniBar data={musicGenres.map((g: any) => ({ label: g.name, count: g.count }))} color="#8b5cf6" height={60} />
              </div>
              <div className="space-y-2">
                {musicGenres.slice(0, 5).map((g: any) => {
                  const max = musicGenres[0]?.count || 1;
                  return (
                    <div key={g.name} className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300 w-20 truncate">{g.name}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(g.count / max) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-6 text-right">{g.count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <p className="text-slate-400 text-sm">No genre data</p>}
        </div>
      </div>

      {/* ── Row 6: Language Distribution + Support ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Language Distribution */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Globe} title="Content by Language" />
          <div className="space-y-3">
            {(languageDist || []).map((l: any) => {
              const total = (languageDist || []).reduce((s: number, x: any) => s + x.count, 0);
              const pct = total > 0 ? Math.round((l.count / total) * 100) : 0;
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
              const idx = (languageDist || []).findIndex((x: any) => x.language === l.language);
              return (
                <div key={l.language}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{l.language || 'Unknown'}</span>
                    <span className="text-slate-900 dark:text-white font-bold">{l.count} <span className="text-xs text-slate-400">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className={`h-full rounded-full ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!languageDist || languageDist.length === 0) && <p className="text-slate-400 text-sm">No language data</p>}
          </div>
        </div>

        {/* Support Overview */}
        <Link href="/dashboard/support" className="glass-card p-5 rounded-2xl hover:border-amber-500/30 transition-colors block">
          <SectionHeading icon={AlertCircle} title="Support Tickets" sub={`${supportResolveRate}% resolved`} />
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total', value: support?.total || 0, color: 'text-slate-800 dark:text-white' },
              { label: 'Pending', value: support?.pending || 0, color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Resolved', value: support?.resolved || 0, color: 'text-emerald-600 dark:text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Resolution rate</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{supportResolveRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${supportResolveRate}%` }} />
            </div>
          </div>
        </Link>
      </div>

      {/* ── Row 7: Recent Users + Recent Videos + Recent Songs ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Users} title="Recent Users" sub="Last 10 registrations" href="/dashboard/users" />
          <div className="space-y-3">
            {(recentUsers || []).slice(0, 10).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex-shrink-0">
                  {u.profileImage
                    ? <Image src={u.profileImage} alt={u.fullName} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm">{u.fullName?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${u.isCreator ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {u.isCreator ? 'Creator' : 'Viewer'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${u.isVerified ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} title={u.isVerified ? 'Verified' : 'Unverified'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Video} title="Recent Uploads" sub="Last 10 videos" href="/dashboard/videos" />
          <div className="space-y-3">
            {(recentVideos || []).slice(0, 10).map((v: any) => (
              <div key={v.id} className="flex items-center gap-3">
                <div className="w-14 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden relative flex-shrink-0">
                  {v.thumbnailUrl && <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{v.title}</p>
                  <p className="text-xs text-slate-400 truncate">by {v.creatorName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmt(v.views)} views</p>
                  <span className={`text-xs ${v.type === 'REEL' ? 'text-rose-500' : 'text-blue-500'}`}>{v.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Songs */}
        <div className="glass-card p-5 rounded-2xl">
          <SectionHeading icon={Music} title="Recent Songs" sub="Last 10 uploads" href="/dashboard/songs" />
          <div className="space-y-3">
            {(recentSongs || []).slice(0, 10).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden relative flex-shrink-0">
                  {s.coverImageUrl && <Image src={s.coverImageUrl} alt={s.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{s.title}</p>
                  <p className="text-xs text-slate-400 truncate">{s.artist}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{fmt(s.plays)} plays</p>
                  <p className="text-xs text-slate-400">{fmt(s.likes)} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
