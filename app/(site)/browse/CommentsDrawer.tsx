'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Comment {
    id: number;
    user_name: string;
    user_avatar: string | null;
    comment: string;
    created_at: string;
}

interface CommentsDrawerProps {
    videoId: number | string;
    onClose: () => void;
}

export function CommentsDrawer({ videoId, onClose }: CommentsDrawerProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    // Fetch Comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/videos/${videoId}/comments`);
                const data = await res.json();
                if (data.comments) {
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('Failed to load comments', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [videoId]);

    // Handle Post Comment
    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session) return;

        setPosting(true);
        try {
            // @ts-ignore
            const token = session.accessToken;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/videos/${videoId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: newComment })
            });

            const data = await res.json();

            if (data.success && data.comment) {
                setComments([data.comment, ...comments]);
                setNewComment('');
                // Scroll to top
                if (listRef.current) listRef.current.scrollTop = 0;
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setPosting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl h-[75vh] md:h-[85vh] md:max-w-md md:right-0 md:left-auto md:rounded-l-3xl md:rounded-tr-none shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-bottom">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                        Comments <span className="text-slate-500 text-sm font-normal">({comments.length})</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* List */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
                >
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <p className="text-lg mb-2">No comments yet</p>
                            <p className="text-sm">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="flex-shrink-0">
                                    {comment.user_avatar ? (
                                        <Image
                                            src={comment.user_avatar}
                                            alt={comment.user_name}
                                            width={32}
                                            height={32}
                                            className="rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                            {comment.user_name?.charAt(0) || <User className="w-4 h-4" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {comment.user_name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {comment.comment}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 pb-safe">
                    {session ? (
                        <form onSubmit={handlePost} className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                {session.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Me"
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                        Me
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full pl-4 pr-12 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || posting}
                                    className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-sm text-slate-500">Log in to like and comment.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
