'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface VideoPlayerProps {
    videoId: number;
    videoUrl: string;
    thumbnailUrl?: string;
    initialTime?: number;
}

export function VideoPlayer({ videoId, videoUrl, thumbnailUrl, initialTime = 0 }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { data: session } = useSession();
    const hasRecordedView = useRef(false);
    const isReady = useRef(false);

    // Reset state when video changes
    useEffect(() => {
        hasRecordedView.current = false;
        isReady.current = false;
    }, [videoId]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && initialTime > 0 && !isReady.current) {
            const handleMetadata = () => {
                video.currentTime = initialTime;
                isReady.current = true;
                console.log('Seeking to initial time:', initialTime);
            };
            video.addEventListener('loadedmetadata', handleMetadata);
            return () => video.removeEventListener('loadedmetadata', handleMetadata);
        }
    }, [initialTime]);

    useEffect(() => {
        const recordView = async () => {
            if (hasRecordedView.current) return;
            hasRecordedView.current = true;

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };

                if (session?.accessToken) {
                    headers['Authorization'] = `Bearer ${session.accessToken}`;
                }

                await fetch(`${apiUrl}/videos/${videoId}/view`, {
                    method: 'POST',
                    headers,
                });

                console.log('Video view recorded for ID:', videoId);
            } catch (error) {
                console.error('Failed to record video view:', error);
            }
        };

        // Record view after 2 seconds of playback or immediately? 
        // For history, recording immediately on metadata load is common.
        const video = videoRef.current;
        if (video) {
            const handlePlay = () => {
                recordView();
            };
            video.addEventListener('play', handlePlay);
            return () => video.removeEventListener('play', handlePlay);
        }
    }, [videoId, session]);

    // Optional: Periodic progress update
    useEffect(() => {
        const interval = setInterval(async () => {
            const video = videoRef.current;
            if (video && !video.paused && session?.accessToken) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                    await fetch(`${apiUrl}/videos/${videoId}/progress`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.accessToken}`
                        },
                        body: JSON.stringify({ position: Math.floor(video.currentTime) })
                    });
                } catch (e) {
                    // Ignore progress sync errors
                }
            }
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [videoId, session]);

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            controls
            className="w-full h-full object-contain"
            autoPlay
        />
    );
}
