import { PrismaClient } from '@prisma/client';
import { config } from '../config.js';
import {
  Repository,
  GraphData,
  FileTreeNode,
  MissionDetail,
  AnalysisStatus,
  DashboardRepo,
  MissionFeedback,
} from '../types/index.js';

let prisma: PrismaClient | null = null;
if (config.DATABASE_URL) {
  try {
    prisma = new PrismaClient();
  } catch (err) {
    console.warn('⚠️ Could not initialize PrismaClient with DATABASE_URL, using in-memory store:', (err as Error).message);
  }
}

export interface AnalysisRecord {
  id: string;
  repositoryId: string;
  repository: Repository;
  status: AnalysisStatus;
  stage: string;
  stageDetail: string;
  commitSha: string;
  graphData: GraphData;
  fileTree: FileTreeNode;
  missions: MissionDetail[];
  hintsUsed: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  token: string;
  completedMissions: Set<string>; // missionId
  submissions: Array<{
    missionId: string;
    answer: string;
    feedback: MissionFeedback;
    createdAt: string;
  }>;
}

// In-memory records
const analyses = new Map<string, AnalysisRecord>();
const sessions = new Map<string, SessionRecord>();

export const storage = {
  async saveAnalysis(record: AnalysisRecord): Promise<void> {
    analyses.set(record.id, record);

    if (prisma) {
      try {
        await prisma.repository.upsert({
          where: { fullName: record.repository.fullName },
          create: {
            id: record.repository.id,
            owner: record.repository.owner,
            name: record.repository.name,
            fullName: record.repository.fullName,
            description: record.repository.description,
            language: record.repository.language,
            defaultBranch: record.repository.defaultBranch,
            commitSha: record.repository.commitSha,
            stars: record.repository.stars,
            fileCount: record.repository.fileCount,
            detectedTechnologies: record.repository.detectedTechnologies,
          },
          update: {
            commitSha: record.repository.commitSha,
            stars: record.repository.stars,
            fileCount: record.repository.fileCount,
            detectedTechnologies: record.repository.detectedTechnologies,
          },
        });

        await prisma.analysis.upsert({
          where: { id: record.id },
          create: {
            id: record.id,
            repositoryId: record.repository.id,
            commitSha: record.commitSha,
            status: record.status,
            graphData: record.graphData as any,
            fileTree: record.fileTree as any,
          },
          update: {
            status: record.status,
            graphData: record.graphData as any,
            fileTree: record.fileTree as any,
          },
        });

        for (const m of record.missions) {
          await prisma.mission.upsert({
            where: { id: m.id },
            create: {
              id: m.id,
              analysisId: record.id,
              type: m.type,
              objective: m.objective,
              startingClue: m.startingClue,
              hints: m.hints,
              relevantFiles: m.relevantFiles,
              order: m.order,
              status: m.status,
            },
            update: {
              status: m.status,
            },
          });
        }
      } catch (err) {
        console.warn('⚠️ Prisma save error:', (err as Error).message);
      }
    }
  },

  async getAnalysis(id: string): Promise<AnalysisRecord | null> {
    const record = analyses.get(id);
    if (record) return record;

    if (prisma) {
      try {
        const found = await prisma.analysis.findUnique({
          where: { id },
          include: { repository: true, missions: true },
        });
        if (found) {
          const loaded: AnalysisRecord = {
            id: found.id,
            repositoryId: found.repositoryId,
            repository: {
              id: found.repository.id,
              owner: found.repository.owner,
              name: found.repository.name,
              fullName: found.repository.fullName,
              description: found.repository.description || '',
              language: found.repository.language,
              defaultBranch: found.repository.defaultBranch,
              commitSha: found.repository.commitSha,
              stars: found.repository.stars,
              fileCount: found.repository.fileCount,
              detectedTechnologies: found.repository.detectedTechnologies,
            },
            status: found.status as AnalysisStatus,
            stage: 'Completed',
            stageDetail: 'Ready for investigation',
            commitSha: found.commitSha,
            graphData: (found.graphData as any) || { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 },
            fileTree: (found.fileTree as any) || { name: 'root', path: '', isDirectory: true, children: [] },
            missions: found.missions.map((m) => ({
              id: m.id,
              type: m.type as any,
              objective: m.objective,
              startingClue: m.startingClue,
              hints: m.hints,
              relevantFiles: m.relevantFiles,
              order: m.order,
              status: m.status as any,
            })),
            hintsUsed: {},
            createdAt: found.createdAt.toISOString(),
            updatedAt: found.updatedAt.toISOString(),
          };
          analyses.set(id, loaded);
          return loaded;
        }
      } catch (err) {
        console.warn('⚠️ Prisma getAnalysis error:', (err as Error).message);
      }
    }

    return null;
  },

  async updateAnalysisStatus(
    id: string,
    status: AnalysisStatus,
    stage: string,
    stageDetail: string
  ): Promise<void> {
    const record = analyses.get(id);
    if (record) {
      record.status = status;
      record.stage = stage;
      record.stageDetail = stageDetail;
      record.updatedAt = new Date().toISOString();
    }
  },

  async getSession(token: string): Promise<SessionRecord> {
    let session = sessions.get(token);
    if (!session) {
      session = {
        id: `sess-${Date.now()}`,
        token,
        completedMissions: new Set<string>(),
        submissions: [],
      };
      sessions.set(token, session);
    }
    return session;
  },

  async recordSubmission(
    token: string,
    missionId: string,
    answer: string,
    correct: boolean,
    feedback?: MissionFeedback
  ): Promise<void> {
    const session = await this.getSession(token);
    session.submissions.push({
      missionId,
      answer,
      feedback: feedback || {
        correct,
        partial: false,
        feedback: correct ? 'Correct answer.' : 'Incorrect answer.',
        explanation: '',
        citations: [],
      },
      createdAt: new Date().toISOString(),
    });
    if (correct) {
      session.completedMissions.add(missionId);
    }
  },

  async listDashboardRepos(sessionToken?: string): Promise<DashboardRepo[]> {
    const list: DashboardRepo[] = [];
    const session = sessionToken ? sessions.get(sessionToken) : null;

    for (const record of analyses.values()) {
      const completedCount = record.missions.filter(
        (m) => m.status === 'completed' || (session && session.completedMissions.has(m.id))
      ).length;

      list.push({
        repositoryId: record.id,
        repository: record.repository,
        analysisStatus: record.status,
        missionsCompleted: completedCount,
        missionsTotal: record.missions.length,
        lastExplored: 'Recently',
      });
    }

    return list;
  },
};
