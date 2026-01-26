'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Comment {
    id: number;
    user_name: string;
    user_avatar: string | null;
    comment: string;
    created_at: string;
}

interface CommentsSectionProps {
    videoId: number | string;
}

export function CommentsSection({ videoId }: CommentsSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [newComment, setNewComment] = useState('');

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
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">
                {comments.length} Comments
            </h3>

            {/* Input Area */}
            <div className="flex gap-4">
                <div className="flex-shrink-0">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Me"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            Me
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    {session ? (
                        <form onSubmit={handlePost} className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full pl-4 pr-12 py-3 bg-[#1f1f1f] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder:text-gray-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || posting}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                    ) : (
                        <div className="p-3 bg-[#1f1f1f] rounded-xl text-sm text-gray-400 border border-white/10">
                            Please <a href="/login" className="text-blue-500 hover:underline">sign in</a> to leave a comment.
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="flex-shrink-0">
                                {comment.user_avatar ? (
                                    <Image
                                        src={comment.user_avatar}
                                        alt={comment.user_name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover border border-white/10"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                        {comment.user_name?.charAt(0) || <User className="w-5 h-5" />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-white">
                                        {comment.user_name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {comment.comment}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
