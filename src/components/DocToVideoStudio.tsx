import React, { useState } from 'react';
import { SAMPLE_DOCS } from '../data/sampleDocs';
import { Scene, Storyboard } from '../types/pipeline';
import { VideoPlayerPreview } from './VideoPlayerPreview';
import { FileText, Wand2, Plus, Trash2, Download, RefreshCw, Copy, Check, Sliders, Play, Code2 } from 'lucide-react';

interface DocToVideoStudioProps {
  onTriggerDeploy?: () => void;
}

export const DocToVideoStudio: React.FC<DocToVideoStudioProps> = ({ onTriggerDeploy }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCS[0].id);
  const [markdown, setMarkdown] = useState<string>(SAMPLE_DOCS[0].markdown);
  const [documentTitle, setDocumentTitle] = useState<string>(SAMPLE_DOCS[0].title);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Default initial scenes derived from sample doc 1
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 'scene-1',
      sceneNumber: 1,
      title: 'Microservices Architecture & Event Streaming',
      subtitle: 'System Architecture Guide',
      layout: 'title',
      narration: 'Welcome to the Microservices Architecture Guide. In this video, we explore how modern distributed systems decouple monolithic logic into resilient, event-driven backbones.',
      duration: 10,
      keyPoints: ['Zero downtime deployments', 'Event-driven orchestration', 'Automated canary rollbacks'],
      highlightStat: '99.99% Availability',
      accentColor: '#3b82f6',
    },
    {
      id: 'scene-2',
      sceneNumber: 2,
      title: 'Core Architecture Topology',
      subtitle: 'Ingress & Service Mesh',
      layout: 'split-code',
      narration: 'The ingress tier routes incoming traffic through an API Gateway with Envoy proxy handling mutual TLS and distributed tracing, backed by Apache Kafka.',
      duration: 12,
      keyPoints: ['API Gateway with Envoy proxy', 'Distributed tracing via OpenTelemetry', 'Apache Kafka event backbone'],
      codeSnippet: `services:\n  gateway:\n    image: envoyproxy/envoy:v1.28\n    ports: ["443:443"]\n  order-service:\n    replicas: 4\n    env:\n      KAFKA_BROKERS: "kafka:9092"`,
      accentColor: '#10b981',
    },
    {
      id: 'scene-3',
      sceneNumber: 3,
      title: 'High-Throughput Ingestion',
      subtitle: 'Partition-Keyed Ordering',
      layout: 'bullet-focus',
      narration: 'Our ingestion pipeline processes over one hundred thousand events per second with sub-fifteen millisecond p99 latency guarantees.',
      duration: 10,
      keyPoints: [
        'Partition-keyed ordering guarantees strictly sequential processing',
        'Dead Letter Queues isolate corrupted payloads without blocking',
        'Prometheus & OpenTelemetry scrape real-time metrics',
      ],
      highlightStat: '100,000+ Events/Sec',
      accentColor: '#8b5cf6',
    },
    {
      id: 'scene-4',
      sceneNumber: 4,
      title: 'Automated Deployment Pipeline',
      subtitle: 'Continuous Verification & Canary Rollouts',
      layout: 'architecture',
      narration: 'Every microservice is packaged into hardened OCI containers with automated vulnerability scanning and automated 1-click rollback via health check alarms.',
      duration: 11,
      keyPoints: ['Hardened OCI containers', 'Canary promotion via Argo Rollouts', 'Instant automated rollbacks'],
      accentColor: '#ec4899',
    },
  ]);

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'storyboard'>('storyboard');

  const handleSelectSample = (id: string) => {
    const found = SAMPLE_DOCS.find((d) => d.id === id);
    if (found) {
      setSelectedDocId(found.id);
      setMarkdown(found.markdown);
      setDocumentTitle(found.title);
    }
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, title: documentTitle }),
      });
      const data = await res.json();
      if (data.success && data.scenes && data.scenes.length > 0) {
        setScenes(data.scenes);
        setActiveSceneIndex(0);
        setActiveTab('storyboard');
      }
    } catch (err) {
      console.error('Error synthesizing storyboard:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const updateCurrentScene = (updates: Partial<Scene>) => {
    setScenes((prev) => {
      const next = [...prev];
      next[activeSceneIndex] = { ...next[activeSceneIndex], ...updates };
      return next;
    });
  };

  const addNewScene = () => {
    const newIdx = scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      sceneNumber: newIdx,
      title: `New Section ${newIdx}`,
      subtitle: 'Key Takeaways & Architecture',
      layout: 'bullet-focus',
      narration: 'In this section, we review the operational metrics and deployment parameters.',
      duration: 10,
      keyPoints: ['Automated pipeline execution', 'Containerized verification', 'Health monitoring'],
      accentColor: '#06b6d4',
    };
    setScenes([...scenes, newScene]);
    setActiveSceneIndex(scenes.length);
  };

  const removeScene = (index: number) => {
    if (scenes.length <= 1) return;
    const filtered = scenes.filter((_, i) => i !== index);
    setScenes(filtered);
    setActiveSceneIndex(Math.max(0, index - 1));
  };

  const copyExportManifest = () => {
    const exportData: Storyboard = {
      title: documentTitle,
      totalDuration: scenes.reduce((a, b) => a + (b.duration || 10), 0),
      scenes,
      createdAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const currentScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div className="space-y-8">
      {/* Top Header / Document Selector Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Doc-to-Video Synthesis Studio</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Automate technical documents, Markdown guides, and release notes into animated video presentations.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Presets:</span>
          {SAMPLE_DOCS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelectSample(doc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDocId === doc.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {doc.category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Left Video Player & Right Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 16:9 Video Canvas Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" /> Live Video Preview Player
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={copyExportManifest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                title="Copy Video Manifest JSON"
              >
                {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExport ? 'Copied JSON' : 'Export JSON'}</span>
              </button>

              {onTriggerDeploy && (
                <button
                  onClick={onTriggerDeploy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Deploy Video Pipeline</span>
                </button>
              )}
            </div>
          </div>

          <VideoPlayerPreview
            scenes={scenes}
            currentSceneIndex={activeSceneIndex}
            onSceneChange={(idx) => setActiveSceneIndex(idx)}
            documentTitle={documentTitle}
          />

          {/* Quick Scene Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {scenes.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => setActiveSceneIndex(i)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all border ${
                  activeSceneIndex === i
                    ? 'bg-slate-800 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sc.accentColor || '#6366f1' }}
                />
                <span className="font-semibold">Scene {i + 1}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{sc.title}</span>
              </button>
            ))}

            <button
              onClick={addNewScene}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-dashed border-indigo-500/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scene</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tabbed Document Source & Scene Parameter Editor */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('storyboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'storyboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Scene Config</span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Markdown Source</span>
              </button>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Synthesizing...' : 'Auto-Synthesize'}</span>
            </button>
          </div>

          {/* Tab 1: Scene Config Editor */}
          {activeTab === 'storyboard' && currentScene && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                  Editing Scene {activeSceneIndex + 1} of {scenes.length}
                </span>
                {scenes.length > 1 && (
                  <button
                    onClick={() => removeScene(activeSceneIndex)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Scene"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Slide Title
                  </label>
                  <input
                    type="text"
                    value={currentScene.title}
                    onChange={(e) => updateCurrentScene({ title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Category / Subtitle
                  </label>
                  <input
                    type="text"
                    value={currentScene.subtitle}
                    onChange={(e) => updateCurrentScene({ subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Layout & Duration Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Visual Layout
                  </label>
                  <select
                    value={currentScene.layout}
                    onChange={(e) => updateCurrentScene({ layout: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="title">Kinetic Title Card</option>
                    <option value="split-code">Split Code &amp; Bullets</option>
                    <option value="bullet-focus">Multi-Card Focus</option>
                    <option value="architecture">Pipeline Topology</option>
                    <option value="summary">Summary &amp; Recap</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Duration: {currentScene.duration}s
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={currentScene.duration}
                    onChange={(e) => updateCurrentScene({ duration: parseInt(e.target.value, 10) })}
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>
              </div>

              {/* Voiceover Narration Script */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Voiceover Narration Script</span>
                  <span className="text-[10px] text-slate-500">Read by TTS Narrator</span>
                </label>
                <textarea
                  rows={3}
                  value={currentScene.narration}
                  onChange={(e) => updateCurrentScene({ narration: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* Key Highlights / Bullets */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Bullet Points (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={currentScene.keyPoints.join('\n')}
                  onChange={(e) =>
                    updateCurrentScene({
                      keyPoints: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Code Snippet if applicable */}
              {currentScene.layout === 'split-code' && (
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Code Snippet / Terminal
                  </label>
                  <textarea
                    rows={4}
                    value={currentScene.codeSnippet || ''}
                    onChange={(e) => updateCurrentScene({ codeSnippet: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Accent Color Picker */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">Theme Accent:</span>
                <div className="flex items-center gap-2">
                  {['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateCurrentScene({ accentColor: color })}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor: currentScene.accentColor === color ? '#ffffff' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Raw Markdown Source */}
          {activeTab === 'editor' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Markdown Content</span>
                  <span className="text-[10px] text-slate-500">{markdown.length} characters</span>
                </label>
                <textarea
                  rows={14}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                <span>Parse Document into Video Scenes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
