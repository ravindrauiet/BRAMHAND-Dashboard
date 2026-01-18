'use client';

import { ThumbsUp, Share2, MoreVertical, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toggleVideoLike } from '@/app/actions/video';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface VideoInteractionsProps {
    videoId: number;
    initialLikes: number;
    initialIsLiked: boolean;
}

export function VideoInteractions({ videoId, initialLikes, initialIsLiked }: VideoInteractionsProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { status } = useSession();

    const handleLike = async () => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }

        // Optimistic Update
        const previousIsLiked = isLiked;
        const previousLikes = likes;

        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);

        try {
            await toggleVideoLike(videoId);
        } catch (error) {
            // Revert on error
            setIsLiked(previousIsLiked);
            setLikes(previousLikes);
            console.error('Failed to toggle like');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <button
                    onClick={handleLike}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800 ${isLiked ? 'text-blue-600' : ''}`}
                >
                    <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{likes}</span>
                </button>
                <button className="px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors rotate-180">
                    <ThumbsUp className="w-5 h-5" />
                </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Share</span>
            </button>
            <button className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
    );
}
