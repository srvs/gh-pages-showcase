
import React, { useState, useEffect } from 'react';
import type { GitHubRepo, Project } from './types';
import Header from './components/Header';
import ProjectCard from './components/ProjectCard';
import Loader from './components/Loader';
// FIX: Renamed import to avoid naming conflict with the built-in 'Error' class.
import ErrorComponent from './components/Error';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const USERNAME = 'srvs';
        const API_URL = `https://api.github.com/users/${USERNAME}/repos?per_page=100`;
        
        const response = await fetch(API_URL);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error(`GitHub API rate limit exceeded. Please try again later.`);
          }
          throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }
        
        const data: GitHubRepo[] = await response.json();
        
        const projectPromises = data
          .filter(repo => !repo.fork)
          .map(async (repo): Promise<Project | null> => {
            try {
              const deploymentsRes = await fetch(repo.deployments_url);
              if (!deploymentsRes.ok) {
                if (deploymentsRes.status === 403) throw new Error('rate limit');
                return null;
              }

              const deployments = await deploymentsRes.json();
              if (!Array.isArray(deployments) || deployments.length === 0) return null;

              const firstDeployment = deployments[0];
              const statusesRes = await fetch(firstDeployment.statuses_url);
              if (!statusesRes.ok) {
                if (statusesRes.status === 403) throw new Error('rate limit');
                return null;
              }

              const statuses = await statusesRes.json();
              if (!Array.isArray(statuses) || statuses.length === 0) return null;

              const latestStatus = statuses[0];
              const environmentUrl = latestStatus.environment_url;
              
              if (environmentUrl && latestStatus.state === 'success') {
                return {
                  id: repo.id,
                  name: repo.name,
                  description: repo.description || 'No description provided for this project.',
                  deployUrl: environmentUrl,
                  repoUrl: repo.html_url,
                };
              }

              return null;
            } catch (e) {
                if (e instanceof Error && e.message === 'rate limit') {
                    throw e; // Propagate rate limit error to Promise.all
                }
                console.error(`Error processing repo ${repo.name}:`, e);
                return null; // For other errors, just skip the repo
            }
          });
        
        const resolvedProjects = await Promise.all(projectPromises);
        
        const deployedProjects = resolvedProjects
          .filter((p): p is Project => p !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setProjects(deployedProjects);

      // FIX: Improved error handling to safely access error properties by checking if 'err' is an instance of Error.
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === 'rate limit') {
            setError('GitHub API rate limit exceeded while fetching project details. Please try again later.');
          } else {
            setError(err.message || 'An unknown error occurred.');
          }
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }
    if (error) {
      // FIX: Use the renamed ErrorComponent.
      return <ErrorComponent message={error} />;
    }
    if (projects.length === 0) {
      return <p className="text-center text-gray-400 text-xl py-20">No deployed projects found.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Header />
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
