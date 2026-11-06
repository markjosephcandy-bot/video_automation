import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DocToVideoStudio } from './components/DocToVideoStudio';
import { DeploymentPipelineConsole } from './components/DeploymentPipelineConsole';
import { GitHubPushHub } from './components/GitHubPushHub';
import { ScriptsViewer } from './components/ScriptsViewer';
import { Film, GitBranch, Terminal, Shield, Sparkles, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero Sub-header / Status Ribbon */}
      <div className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-indigo-400 font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Automated Pipeline Architecture
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono hidden sm:inline">
              Markdown ➔ Storyboard ➔ 60fps Video ➔ CI/CD Deployment
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3 h-3 text-emerald-400" />
              Port: 3000
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <GitBranch className="w-3 h-3 text-indigo-400" />
              main branch
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'studio' && (
          <DocToVideoStudio onTriggerDeploy={() => setActiveTab('pipeline')} />
        )}

        {activeTab === 'pipeline' && (
          <DeploymentPipelineConsole onOpenGitHubPush={() => setActiveTab('github')} />
        )}

        {activeTab === 'github' && (
          <GitHubPushHub />
        )}

        {activeTab === 'scripts' && (
          <ScriptsViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div>
            Doc_video_automation :: Automated Deployment &amp; Video Engine
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>./scripts/deploy.sh</span>
            <span>•</span>
            <span>./scripts/push_to_github.sh</span>
            <span>•</span>
            <a
              href="https://github.com/markjosephcandy-bot/Doc_video_automation"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
