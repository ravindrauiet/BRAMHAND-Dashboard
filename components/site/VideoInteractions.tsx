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
        <div className="flex items-center rounded-full overflow-hidden bg-white/10 hover:bg-white/20 transition-colors">
            <button
                onClick={handleLike}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 border-r border-white/10 ${isLiked ? 'text-blue-500' : 'text-white'}`}
            >
                <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium text-sm">{likes}</span>
            </button>
            <button className="px-4 py-2.5 rotate-180 text-white hover:text-red-400">
                <ThumbsUp className="w-5 h-5" />
            </button>
        </div>
    );
}
