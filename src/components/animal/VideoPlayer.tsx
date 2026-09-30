"use client";

import React, { useRef, useState, useEffect } from "react";
import { ICloudinaryAsset } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { APP_CONFIG } from "@/config/app";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Video as VideoIcon,
} from "lucide-react";

interface VideoPlayerProps {
  video: ICloudinaryAsset;
  posterUrl?: string;
  animalTitle?: string;
}

export function VideoPlayer({ video, posterUrl, animalTitle }: VideoPlayerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-hide controls after 3s of inactivity while playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && showControls) {
      timer = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, duration)
      );
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full bg-zinc-950 rounded-2xl overflow-hidden border border-emerald-900/60 shadow-lg">
      <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <VideoIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{t("animal.video")}</span>
        </div>
        <span className="text-[11px] text-zinc-400">
          {t("videoPlayer.durationLimitNote", {
            max: APP_CONFIG.MAX_VIDEO_DURATION_SECONDS,
          })}
        </span>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        onClick={() => setShowControls((prev) => !prev)}
        className="relative aspect-video sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden cursor-pointer group"
      >
        <video
          ref={videoRef}
          src={video.secure_url}
          poster={posterUrl}
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          className="w-full h-full object-contain"
        />

        {/* Center Large Play Button Overlay before started or when paused */}
        {(!isPlaying || !hasStarted) && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
            </div>
          </div>
        )}

        {/* Custom Mobile-Friendly Player Controls Overlay */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 sm:px-4 py-3 transition-opacity duration-300 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Seek Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="Seek video progress"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            {/* Playback Controls & Time */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all text-white"
                aria-label={isPlaying ? t("videoPlayer.pause") : t("videoPlayer.play")}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                type="button"
                onClick={() => skipTime(-5)}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
                aria-label={t("videoPlayer.rewind5")}
                title={t("videoPlayer.rewind5")}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => skipTime(5)}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
                aria-label={t("videoPlayer.forward5")}
                title={t("videoPlayer.forward5")}
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-zinc-300 select-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Volume & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
                aria-label={isMuted ? t("videoPlayer.unmute") : t("videoPlayer.mute")}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 active:scale-90 transition-all text-zinc-300 hover:text-white"
                aria-label={isFullscreen ? t("videoPlayer.exitFullscreen") : t("videoPlayer.fullscreen")}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
