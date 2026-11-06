import React, { useState, useEffect } from 'react';
import { GitStatusInfo } from '../types/pipeline';
import { GitBranch, GitCommit, GitPullRequest, Key, UploadCloud, Terminal, Check, Copy, AlertTriangle, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GitHubPushHub: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<GitStatusInfo | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [commitMessage, setCommitMessage] = useState(
    'feat(pipeline): automated doc-to-video pipeline and deployment scripts'
  );
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    logs?: string[];
    needsAuth?: boolean;
    instructions?: string[];
  } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
      }
    } catch (err) {
      console.error('Failed to load git status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePush = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim() || undefined,
          commitMessage: commitMessage.trim(),
        }),
      });

      const data = await res.json();
      setPushResult(data);

      if (data.success) {
        fetchStatus();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        error: err.message || 'Push request failed',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const cliPushScriptCmd = `./scripts/push_to_github.sh "${commitMessage}"`;
  const cliTokenPushCmd = githubToken
    ? `git push https://${githubToken}@github.com/markjosephcandy-bot/Doc_video_automation.git main`
    : `git push https://<YOUR_GITHUB_PAT>@github.com/markjosephcandy-bot/Doc_video_automation.git main`;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <UploadCloud className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">GitHub Repository Push Hub</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Push code, automation pipeline, and deployment scripts to{' '}
            <a
              href="https://github.com/markjosephcandy-bot/Doc_video_automation"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline font-mono inline-flex items-center gap-1"
            >
              markjosephcandy-bot/Doc_video_automation.git
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoadingStatus}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          <span>Refresh Git Status</span>
        </button>
      </div>

      {/* Main Grid: Push Form & Git Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Push Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-indigo-400" />
              Automated Push to GitHub
            </h3>
            <p className="text-xs text-slate-400">
              Stages all modified and new files, creates a git commit, and pushes to remote branch <code className="text-indigo-300 font-mono">main</code>.
            </p>
          </div>

          <form onSubmit={handlePush} className="space-y-5">
            {/* Target Repo Display */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Target Remote Repository
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
                <span>https://github.com/markjosephcandy-bot/Doc_video_automation.git</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  ORIGIN / MAIN
                </span>
              </div>
            </div>

            {/* Commit Message */}
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Commit Message
              </label>
              <input
                type="text"
                required
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="e.g. feat: doc-to-video automation and deployment script"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* GitHub Personal Access Token (PAT) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  GitHub Personal Access Token (PAT)
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  Required by GitHub for HTTPS git push
                </span>
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (or github_pat_...)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Token needs <code className="text-slate-400 font-semibold font-mono">repo</code> scope. Never shared or stored beyond this request.
              </p>
            </div>

            {/* Push Button */}
            <button
              type="submit"
              disabled={isPushing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-900/40 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Pushing to GitHub (origin main)...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Execute Push to markjosephcandy-bot/Doc_video_automation</span>
                </>
              )}
            </button>
          </form>

          {/* Result or Error Banner */}
          {pushResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                pushResult.success
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                {pushResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Push Successful!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Push Needs Authentication</span>
                  </>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-300">
                {pushResult.message || pushResult.error}
              </p>

              {pushResult.instructions && (
                <div className="mt-2 space-y-1 text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-sans">
                  {pushResult.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-mono">•</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              )}

              {pushResult.logs && pushResult.logs.length > 0 && (
                <div className="mt-2 p-2.5 rounded bg-slate-950/80 font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto space-y-0.5">
                  {pushResult.logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Git Status & Terminal Commands */}
        <div className="lg:col-span-5 space-y-6">
          {/* Git Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Git Workspace State
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-semibold">
                branch: {gitStatus?.branch || 'main'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Remote Origin:</span>
                <span className="text-slate-200 truncate max-w-[200px]">
                  {gitStatus?.repository || 'Doc_video_automation.git'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Last Commit:</span>
                <span className="text-emerald-400 font-semibold">
                  {gitStatus?.lastCommit?.hash || 'HEAD'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Message:</span>
                <span className="text-slate-300 truncate max-w-[200px]">
                  {gitStatus?.lastCommit?.message || 'initial'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Modified Files:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    gitStatus?.clean ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {gitStatus?.clean ? 'Clean' : `${gitStatus?.modifiedFilesCount} changed`}
                </span>
              </div>
            </div>

            {gitStatus?.modifiedFiles && gitStatus.modifiedFiles.length > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-400 max-h-28 overflow-y-auto space-y-0.5">
                {gitStatus.modifiedFiles.map((file, i) => (
                  <div key={i} className="truncate">
                    {file}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick CLI Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Automated Terminal Commands
              </h3>
            </div>

            <div className="space-y-3">
              {/* Command 1: Automation Script */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  1. Run Automated Git Push Script
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 group">
                  <code className="truncate mr-2">{cliPushScriptCmd}</code>
                  <button
                    onClick={() => copyToClipboard(cliPushScriptCmd, 'script')}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === 'script' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command 2: Direct Push with Token */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  2. Direct Git Push with PAT
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 group">
                  <code className="truncate mr-2">{cliTokenPushCmd}</code>
                  <button
                    onClick={() => copyToClipboard(cliTokenPushCmd, 'token-push')}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === 'token-push' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Command 3: Run Deployment Pipeline */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  3. Run Automated Deployment
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 group">
                  <code className="truncate mr-2">./scripts/deploy.sh</code>
                  <button
                    onClick={() => copyToClipboard('./scripts/deploy.sh', 'deploy')}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === 'deploy' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
