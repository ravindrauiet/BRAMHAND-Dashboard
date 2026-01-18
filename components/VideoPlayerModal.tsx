'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface VideoPlayerModalProps {
    videoUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

export function VideoPlayerModal({ videoUrl, isOpen, onClose }: VideoPlayerModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl relative overflow-hidden border border-slate-700">
                <div className="flex justify-between items-center p-4 bg-slate-800/50">
                    <h3 className="text-white font-medium">Video Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="aspect-video bg-black relative">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
}
