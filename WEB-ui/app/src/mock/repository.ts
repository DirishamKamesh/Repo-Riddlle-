import { Repository, DashboardRepo } from '../types';

export const DEMO_REPOSITORY: Repository = {
  id: 'demo-task-api',
  owner: 'demo-org',
  name: 'task-api',
  fullName: 'demo-org/task-api',
  description: 'Production-ready REST API for distributed task management and workflow automation.',
  language: 'TypeScript',
  defaultBranch: 'main',
  commitSha: '9a4b2c1f',
  stars: 1420,
  fileCount: 14,
  detectedTechnologies: ['Node.js', 'Express', 'TypeScript', 'Zod', 'Jest'],
};

export const DEMO_DASHBOARD_REPOS: DashboardRepo[] = [
  {
    repositoryId: 'demo-task-api',
    repository: DEMO_REPOSITORY,
    analysisStatus: 'complete',
    missionsCompleted: 1,
    missionsTotal: 3,
    lastExplored: '10 minutes ago',
  },
  {
    repositoryId: 'demo-auth-service',
    repository: {
      id: 'demo-auth-service',
      owner: 'demo-org',
      name: 'auth-service',
      fullName: 'demo-org/auth-service',
      description: 'OAuth2 and JWT authentication microservice with Redis session management.',
      language: 'TypeScript',
      defaultBranch: 'main',
      commitSha: '4c8e102a',
      stars: 875,
      fileCount: 19,
      detectedTechnologies: ['Fastify', 'TypeScript', 'Redis', 'JWT'],
    },
    analysisStatus: 'complete',
    missionsCompleted: 0,
    missionsTotal: 3,
    lastExplored: 'Yesterday',
  },
];
