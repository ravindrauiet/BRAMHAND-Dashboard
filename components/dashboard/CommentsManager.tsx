'use client';

import { useState, useEffect } from 'react';
import { deleteComment, getVideoComments } from '@/app/actions/comments';
import { useRouter } from 'next/navigation';

interface Comment {
    id: number;
    text: string;
    createdAt: Date;
    user: {
        id: number;
        fullName: string;
        profileImage: string | null;
    };
}

export default function CommentsManager({ videoId }: { videoId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadComments();
    }, [videoId]);

    async function loadComments() {
        const res = await getVideoComments(videoId);
        if (res.comments) {
            setComments(res.comments);
        }
        setLoading(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        const res = await deleteComment(id, videoId);
        if (res.success) {
            setComments(comments.filter(c => c.id !== id));
            router.refresh();
        } else {
            alert('Failed to delete comment');
        }
    }

    if (loading) return <div>Loading comments...</div>;

    return (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Comments ({comments.length})</h3>
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500">No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                    {comment.user.profileImage ? (
                                        <img src={comment.user.profileImage} alt={comment.user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        comment.user.fullName.charAt(0)
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{comment.user.fullName}</p>
                                        <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <p className="mt-1 text-gray-700 text-sm">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
