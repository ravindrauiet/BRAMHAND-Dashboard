'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AppBannerProps {
  videoId?: string | number;
  songId?: string | number;
  seriesId?: string | number;
}

/**
 * Smart app banner shown on mobile browsers.
 * - Android: "Open in App" button deep-links into the installed app, or
 *   redirects to the Play Store if not installed.
 * - iOS: links to the App Store (when the iOS app is published).
 * - Desktop: hidden.
 */
export default function AppBanner({ videoId, songId, seriesId }: AppBannerProps) {
  const [show, setShow] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const android = /android/i.test(ua);
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsAndroid(android);
    setShow(android || ios);
  }, []);

  if (!show) return null;

  // Build the deep-link path
  const deepPath = videoId
    ? `/watch/${videoId}`
    : seriesId
    ? `/series/${seriesId}`
    : songId
    ? `/song/${songId}`
    : '/';

  const appDeepLink = `https://tirhuta.com${deepPath}`;
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.tirhuta.videostreaming';
  const appStoreUrl = 'https://apps.apple.com/app/tirhuta'; // update when live

  const storeUrl = isAndroid ? playStoreUrl : appStoreUrl;

  /**
   * Attempt to open the installed app via the App Link.
   * If the app isn't installed, the intent fails silently and we fall back
   * to the Play Store after a short timeout.
   */
  const handleOpen = () => {
    if (!isAndroid) {
      window.location.href = storeUrl;
      return;
    }
    // Try the deep link — Android will open the app if installed
    window.location.href = appDeepLink;

    // If app is not installed the browser stays put; after 1.5 s redirect to Play Store
    const timer = setTimeout(() => {
      window.location.href = storeUrl;
    }, 1500);

    // If the page hides (app opened) cancel the redirect
    const onBlur = () => clearTimeout(timer);
    window.addEventListener('blur', onBlur, { once: true });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3
                    bg-[#111] border-b border-white/10 shadow-lg">
      {/* App icon */}
      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
        <span className="text-white font-black text-lg">T</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">Tirhuta</p>
        <p className="text-white/50 text-xs truncate">Better experience in the app</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setShow(false)}
        className="text-white/40 hover:text-white/70 text-xl leading-none px-1 flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>

      {/* CTA */}
      <button
        onClick={handleOpen}
        className="flex-shrink-0 bg-orange-500 hover:bg-orange-400 active:bg-orange-600
                   text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
      >
        Open
      </button>
    </div>
  );
}
