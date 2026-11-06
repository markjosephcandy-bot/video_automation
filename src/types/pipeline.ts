export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  subtitle: string;
  layout: 'title' | 'bullet-focus' | 'split-code' | 'architecture' | 'summary';
  narration: string;
  duration: number; // in seconds
  keyPoints: string[];
  codeSnippet?: string;
  highlightStat?: string;
  accentColor: string;
}

export interface Storyboard {
  title: string;
  totalDuration: number;
  scenes: Scene[];
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  durationMs?: number;
  logs?: string[];
  output?: string;
}

export interface GitStatusInfo {
  repository: string;
  branch: string;
  remoteUrl: string;
  clean: boolean;
  modifiedFilesCount: number;
  modifiedFiles: string[];
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    time: string;
  };
  diffStat?: string;
}

export type DeploymentTarget = 'docker' | 'cloud-run' | 'local' | 'vercel' | 'github-pages';
