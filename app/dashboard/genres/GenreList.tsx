'use client';

import { useState } from 'react';
import {
    Search,
    LayoutGrid,
    List as ListIcon,
    Plus,
    Film,
    Music,
    MoreVertical,
    Power,
    PowerOff,
    Languages,
    Disc
} from 'lucide-react';
import { toggleVideoGenreStatus, toggleMusicGenreStatus } from './actions';

interface GenreListProps {
    videoGenres: any[];
    musicGenres: any[];
}

export function GenreList({ videoGenres, musicGenres }: GenreListProps) {
    const [activeTab, setActiveTab] = useState<'video' | 'music'>('video');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const currentGenres = activeTab === 'video' ? videoGenres : musicGenres;

    const filteredGenres = currentGenres.filter(genre => {
        const matchesSearch =
            genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (genre.nameHindi && genre.nameHindi.toLowerCase().includes(searchQuery.toLowerCase()));

        if (filter === 'active') return matchesSearch && genre.isActive;
        if (filter === 'inactive') return matchesSearch && !genre.isActive;
        return matchesSearch;
    });

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        if (activeTab === 'video') {
            await toggleVideoGenreStatus(id, !currentStatus);
        } else {
            await toggleMusicGenreStatus(id, !currentStatus);
        }
    };

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('video')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'video'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Film className="w-4 h-4" /> Video Genres
                    </button>
                    <button
                        onClick={() => setActiveTab('music')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'music'
                                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Music className="w-4 h-4" /> Music Genres
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">

                {/* Search and Filter */}
                <div className="flex flex-1 gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab} genres...`}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* View Toggles & Add Button */}
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <button className={`
                        px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-lg text-white font-medium
                        ${activeTab === 'video'
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                            : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'}
                    `}>
                        <Plus className="w-5 h-5" />
                        <span>Add Genre</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGenres.map((genre) => (
                        <div key={genre.id} className="group bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${genre.isActive
                                ? (activeTab === 'video' ? 'bg-gradient-to-b from-blue-500 to-cyan-500' : 'bg-gradient-to-b from-purple-500 to-pink-500')
                                : 'bg-slate-300 dark:bg-slate-700'
                                }`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className={`
                                    p-3 rounded-2xl transition-colors
                                    ${activeTab === 'video'
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'}
                                `}>
                                    {activeTab === 'video' ? <Film className="w-8 h-8" /> : <Disc className="w-8 h-8" />}
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${genre.isActive
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {genre.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{genre.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                <Languages className="w-4 h-4" />
                                <span>{genre.nameHindi || 'No translation'}</span>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    onClick={() => handleToggleStatus(genre.id, genre.isActive)}
                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${genre.isActive
                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20'
                                        }`}
                                >
                                    {genre.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    {genre.isActive ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Genre Name</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Hindi Translation</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredGenres.map((genre) => (
                                <tr key={genre.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${activeTab === 'video'
                                                    ? 'bg-blue-50 text-blue-500 dark:bg-slate-800 dark:text-blue-400'
                                                    : 'bg-purple-50 text-purple-500 dark:bg-slate-800 dark:text-purple-400'
                                                }`}>
                                                {activeTab === 'video' ? <Film className="w-4 h-4" /> : <Disc className="w-4 h-4" />}
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{genre.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {genre.nameHindi || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${genre.isActive
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${genre.isActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                            {genre.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(genre.id, genre.isActive)}
                                                className={`p-2 rounded-lg transition-colors ${genre.isActive
                                                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                                        : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                                    }`}
                                                title={genre.isActive ? "Disable" : "Enable"}
                                            >
                                                {genre.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredGenres.length === 0 && (
                <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <Search className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white">No genres found</p>
                    <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
