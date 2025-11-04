export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  deployments_url: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  deployUrl: string;
  repoUrl: string;
}
