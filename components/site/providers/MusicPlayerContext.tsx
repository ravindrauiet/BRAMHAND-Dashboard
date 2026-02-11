'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

type Song = {
    id: number;
    title: string;
    artist: string;
    cover_image_url: string;
    audio_url: string;
    genre_name?: string;
};

type MusicPlayerContextType = {
    currentSong: Song | null;
    isPlaying: boolean;
    playSong: (song: Song, queue?: Song[]) => void;
    togglePlay: () => void;
    pauseSong: () => void;
    playNext: () => void;
    playPrevious: () => void;
    currentTime: number;
    duration: number;
    volume: number;
    seek: (time: number) => void;
    changeVolume: (val: number) => void;
    queue: Song[];
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.volume = volume;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => {
            playNext();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [queue, currentSong]);

    useEffect(() => {
        if (currentSong && audioRef.current) {
            const audioLink = currentSong.audio_url.startsWith('http')
                ? currentSong.audio_url
                : `${process.env.NEXT_PUBLIC_API_URL}${currentSong.audio_url}`;

            if (audioRef.current.src !== audioLink) {
                audioRef.current.src = audioLink;
                audioRef.current.play().catch(e => console.error("Playback failed", e));
                setIsPlaying(true);
            } else {
                if (isPlaying) audioRef.current.play();
                else audioRef.current.pause();
            }
        } else if (!currentSong && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [currentSong, isPlaying]);


    const playSong = (song: Song, newQueue?: Song[]) => {
        if (currentSong?.id === song.id && !newQueue) {
            togglePlay();
        } else {
            setCurrentSong(song);
            if (newQueue) {
                setQueue(newQueue);
            }
            setIsPlaying(true);
        }
    };

    const playNext = () => {
        if (!currentSong || queue.length === 0) return;
        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        if (currentIndex === -1 || currentIndex === queue.length - 1) {
            // End of queue or song not in queue
            setIsPlaying(false);
        } else {
            setCurrentSong(queue[currentIndex + 1]);
            setIsPlaying(true);
        }
    };

    const playPrevious = () => {
        if (!currentSong || queue.length === 0) return;
        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        if (currentIndex > 0) {
            setCurrentSong(queue[currentIndex - 1]);
            setIsPlaying(true);
        } else {
            // Restart current song
            if (audioRef.current) audioRef.current.currentTime = 0;
        }
    };

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const pauseSong = () => {
        setIsPlaying(false);
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const changeVolume = (val: number) => {
        if (audioRef.current) {
            audioRef.current.volume = val;
            setVolume(val);
        }
    };

    return (
        <MusicPlayerContext.Provider value={{
            currentSong,
            isPlaying,
            playSong,
            togglePlay,
            pauseSong,
            playNext,
            playPrevious,
            currentTime,
            duration,
            volume,
            seek,
            changeVolume,
            queue
        }}>
            {children}
        </MusicPlayerContext.Provider>
    );
}

export function useMusicPlayer() {
    const context = useContext(MusicPlayerContext);
    if (!context) {
        throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
    }
    return context;
}
