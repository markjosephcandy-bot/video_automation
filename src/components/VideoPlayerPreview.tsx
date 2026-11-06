import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, SkipForward, SkipBack, Sparkles, Code, CheckCircle2, Layers, Cpu } from 'lucide-react';
import { Scene } from '../types/pipeline';

interface VideoPlayerPreviewProps {
  scenes: Scene[];
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  documentTitle: string;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  scenes,
  currentSceneIndex,
  onSceneChange,
  documentTitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 10), 0);

  // Calculate overall time elapsed
  const sceneStartTimes = scenes.reduce<number[]>((acc, s, i) => {
    if (i === 0) return [0];
    return [...acc, acc[i - 1] + (scenes[i - 1].duration || 10)];
  }, []);

  const currentSceneDuration = (currentScene?.duration || 10) / playbackSpeed;
  const currentElapsedOverall = (sceneStartTimes[currentSceneIndex] || 0) + (sceneProgress * (currentScene?.duration || 10));

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Handle SpeechSynthesis audio narration
  const speakSceneNarration = (narration: string) => {
    if (!speechSupported || isMuted || typeof window === 'undefined') return;

    window.speechSynthesis.cancel();
    if (!narration) return;

    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Pick an English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      // Completed narration for this scene
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (speechSupported && typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Trigger voice narration on scene start or play
    if (sceneProgress < 0.1 && currentScene) {
      speakSceneNarration(currentScene.narration);
    }

    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      setSceneProgress((prev) => {
        const nextProgress = prev + (delta / currentSceneDuration);
        if (nextProgress >= 1) {
          // Advance to next scene
          if (currentSceneIndex < scenes.length - 1) {
            onSceneChange(currentSceneIndex + 1);
            return 0;
          } else {
            // Reached end of video
            setIsPlaying(false);
            if (speechSupported && typeof window !== 'undefined') {
              window.speechSynthesis.cancel();
            }
            return 1;
          }
        }
        return nextProgress;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentSceneIndex, scenes, playbackSpeed, currentSceneDuration, speechSupported, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (speechSupported && typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    } else {
      if (sceneProgress >= 1 && currentSceneIndex >= scenes.length - 1) {
        onSceneChange(0);
        setSceneProgress(0);
      }
      setIsPlaying(true);
      if (currentScene) {
        speakSceneNarration(currentScene.narration);
      }
    }
  };

  const restartVideo = () => {
    setIsPlaying(false);
    if (speechSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    onSceneChange(0);
    setSceneProgress(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && speechSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    } else if (isMuted && isPlaying && currentScene) {
      speakSceneNarration(currentScene.narration);
    }
  };

  const nextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      onSceneChange(currentSceneIndex + 1);
      setSceneProgress(0);
      if (isPlaying && scenes[currentSceneIndex + 1]) {
        speakSceneNarration(scenes[currentSceneIndex + 1].narration);
      }
    }
  };

  const prevScene = () => {
    if (currentSceneIndex > 0) {
      onSceneChange(currentSceneIndex - 1);
      setSceneProgress(0);
      if (isPlaying && scenes[currentSceneIndex - 1]) {
        speakSceneNarration(scenes[currentSceneIndex - 1].narration);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!currentScene) {
    return <div className="p-8 text-center text-slate-400">No scenes loaded.</div>;
  }

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = Math.floor(sec % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Viewport Container (16:9 ratio) */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none"
      >
        {/* Subtle grid and decorative background elements */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${currentScene.accentColor} 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top Header Bar inside Video */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="px-2.5 py-1 text-xs font-semibold rounded-md tracking-wider uppercase backdrop-blur-md shadow-sm border border-white/10"
              style={{ backgroundColor: `${currentScene.accentColor}25`, color: currentScene.accentColor }}
            >
              Scene {currentSceneIndex + 1} of {scenes.length}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {documentTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Audio Narration Equalizer Indicator */}
            {isPlaying && !isMuted && (
              <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium uppercase tracking-wider">AI Voice Narration</span>
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-2" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms] h-3.5" />
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:75ms] h-1.5" />
                </div>
              </div>
            )}
            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              60 FPS HD
            </span>
          </div>
        </div>

        {/* Dynamic Center Stage Content based on Layout */}
        <div className="relative z-10 my-auto py-2">
          {currentScene.layout === 'title' && (
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 mb-2"
                style={{ backgroundColor: `${currentScene.accentColor}30` }}
              >
                <Sparkles className="w-8 h-8" style={{ color: currentScene.accentColor }} />
              </div>
              <p
                className="text-xs sm:text-sm font-semibold tracking-widest uppercase font-mono"
                style={{ color: currentScene.accentColor }}
              >
                {currentScene.subtitle}
              </p>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {currentScene.title}
              </h1>
              {currentScene.highlightStat && (
                <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {currentScene.highlightStat}
                </div>
              )}
            </div>
          )}

          {currentScene.layout === 'split-code' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span
                  className="text-xs font-mono font-semibold tracking-wider uppercase"
                  style={{ color: currentScene.accentColor }}
                >
                  {currentScene.subtitle}
                </span>
                <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentScene.title}
                </h2>
                <div className="space-y-2 mt-4">
                  {currentScene.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 transform transition-all duration-300"
                      style={{
                        opacity: sceneProgress > (i / (currentScene.keyPoints.length + 1)) ? 1 : 0.4,
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Panel */}
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950/90 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-slate-300 flex items-center gap-1">
                      <Code className="w-3 h-3 text-indigo-400" /> manifest.sh
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Pipeline Spec</span>
                </div>
                <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                  <code>{currentScene.codeSnippet || '// Automated doc execution flow\n$ npm run build\n$ ./scripts/deploy.sh\n✔ Deployed to Docker'}</code>
                </pre>
              </div>
            </div>
          )}

          {currentScene.layout === 'bullet-focus' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span
                  className="text-xs font-mono font-semibold tracking-wider uppercase"
                  style={{ color: currentScene.accentColor }}
                >
                  {currentScene.subtitle}
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  {currentScene.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {currentScene.keyPoints.map((point, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:border-slate-700"
                    style={{
                      transform: sceneProgress > (i / currentScene.keyPoints.length) ? 'translateY(0)' : 'translateY(8px)',
                      opacity: sceneProgress > (i / currentScene.keyPoints.length) ? 1 : 0.5,
                      borderColor: sceneProgress > (i / currentScene.keyPoints.length) ? `${currentScene.accentColor}50` : undefined,
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300 mb-2.5">
                      0{i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentScene.layout === 'architecture' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span
                  className="text-xs font-mono font-semibold tracking-wider uppercase"
                  style={{ color: currentScene.accentColor }}
                >
                  System Flow &amp; Automation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentScene.title}
                </h2>
              </div>

              {/* Kinetic Pipeline Flow Diagram */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <div className="flex-1 w-full p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-center space-y-1">
                  <Layers className="w-5 h-5 mx-auto text-indigo-400" />
                  <div className="text-xs font-semibold text-white">1. Doc Parsing</div>
                  <div className="text-[10px] text-slate-400 font-mono">AST &amp; Headings</div>
                </div>
                <div className="text-slate-600 font-bold hidden sm:block">➔</div>
                <div className="flex-1 w-full p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-center space-y-1">
                  <Sparkles className="w-5 h-5 mx-auto text-emerald-400" />
                  <div className="text-xs font-semibold text-white">2. AI Storyboard</div>
                  <div className="text-[10px] text-slate-400 font-mono">Scenes &amp; Speech</div>
                </div>
                <div className="text-slate-600 font-bold hidden sm:block">➔</div>
                <div className="flex-1 w-full p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-center space-y-1">
                  <Cpu className="w-5 h-5 mx-auto text-amber-400" />
                  <div className="text-xs font-semibold text-white">3. Video Canvas</div>
                  <div className="text-[10px] text-slate-400 font-mono">60fps Timeline</div>
                </div>
                <div className="text-slate-600 font-bold hidden sm:block">➔</div>
                <div className="flex-1 w-full p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-cyan-400" />
                  <div className="text-xs font-semibold text-white">4. CI/CD Deploy</div>
                  <div className="text-[10px] text-slate-400 font-mono">Automated Push</div>
                </div>
              </div>
            </div>
          )}

          {currentScene.layout === 'summary' && (
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentScene.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentScene.narration}
              </p>
              {currentScene.highlightStat && (
                <div className="inline-block px-4 py-2 bg-slate-800 rounded-lg text-emerald-400 font-mono text-sm border border-slate-700">
                  ⚡ {currentScene.highlightStat}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Subtitle / Narration Closed Caption Overlay */}
        <div className="relative z-10 mt-auto">
          <div className="bg-slate-950/85 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 text-center">
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed tracking-wide">
              {currentScene.narration}
            </p>
          </div>
        </div>
      </div>

      {/* Video Player Scrub Bar & Controls Toolbar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
        {/* Timeline Progress Bar with Scene Segments */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{formatSeconds(currentElapsedOverall)}</span>
            <span className="text-slate-500">
              Scene {currentSceneIndex + 1}/{scenes.length}
            </span>
            <span>{formatSeconds(totalDuration)}</span>
          </div>

          {/* Segmented Timeline */}
          <div className="flex gap-1.5 w-full h-2 rounded-full bg-slate-800/80 p-0.5">
            {scenes.map((scene, idx) => {
              const isPast = idx < currentSceneIndex;
              const isCurrent = idx === currentSceneIndex;
              const widthRatio = (scene.duration || 10) / totalDuration * 100;

              return (
                <div
                  key={scene.id}
                  onClick={() => {
                    onSceneChange(idx);
                    setSceneProgress(0);
                    if (isPlaying) speakSceneNarration(scenes[idx].narration);
                  }}
                  className="relative h-full rounded-full cursor-pointer overflow-hidden transition-all duration-150 hover:opacity-90"
                  style={{ width: `${widthRatio}%`, backgroundColor: '#334155' }}
                  title={`Scene ${idx + 1}: ${scene.title}`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: isPast ? '100%' : isCurrent ? `${sceneProgress * 100}%` : '0%',
                      backgroundColor: scene.accentColor || '#6366f1',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={prevScene}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
              title="Previous Scene"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
            </button>

            <button
              onClick={nextScene}
              disabled={currentSceneIndex === scenes.length - 1}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
              title="Next Scene"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={restartVideo}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
              {[1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded transition-colors ${
                    playbackSpeed === spd ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
