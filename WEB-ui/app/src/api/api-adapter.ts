import {
  ApiClient,
  AnalysisDetailResponse,
  GraphResponse,
} from './client';
import {
  AnalyzeResponse,
  AnalysisStatusResponse,
  SourceFile,
  MissionSummary,
  MissionDetail,
  MissionFeedback,
  SubmitRequest,
  HintResponse,
  DashboardRepo,
} from '../types';

export class RealApiAdapter implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const envBaseUrl =
      typeof import.meta !== 'undefined' && (import.meta as any).env
        ? (import.meta as any).env.VITE_API_BASE_URL
        : undefined;
    this.baseUrl = baseUrl || envBaseUrl || 'http://localhost:3001/api';
  }

  private getSessionToken(): string {
    if (typeof localStorage === 'undefined') {
      return 'node_test_session';
    }
    let token = localStorage.getItem('reporiddle_session_token');
    if (!token) {
      token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('reporiddle_session_token', token);
    }
    return token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getSessionToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async analyzeRepo(url: string): Promise<AnalyzeResponse> {
    return this.request<AnalyzeResponse>('/repo/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
    return this.request<AnalysisStatusResponse>(`/analysis/${encodeURIComponent(analysisId)}/status`);
  }

  async getAnalysis(analysisId: string): Promise<AnalysisDetailResponse> {
    return this.request<AnalysisDetailResponse>(`/analysis/${encodeURIComponent(analysisId)}`);
  }

  async getGraph(graphId: string): Promise<GraphResponse> {
    return this.request<GraphResponse>(`/graph/${encodeURIComponent(graphId)}`);
  }

  async getSourceFile(graphId: string, filePath: string): Promise<SourceFile> {
    const data = await this.request<{ file: SourceFile }>(
      `/graph/${encodeURIComponent(graphId)}/file?path=${encodeURIComponent(filePath)}`
    );
    return data.file;
  }

  async getMissions(analysisId: string): Promise<MissionSummary[]> {
    const data = await this.request<{ missions: MissionSummary[] }>(
      `/missions/${encodeURIComponent(analysisId)}`
    );
    return data.missions;
  }

  async getMissionDetail(missionId: string, analysisId: string): Promise<MissionDetail> {
    const data = await this.request<{ mission: MissionDetail }>(
      `/missions/${encodeURIComponent(missionId)}/detail?analysisId=${encodeURIComponent(analysisId)}`
    );
    return data.mission;
  }

  async requestHint(missionId: string, analysisId: string): Promise<HintResponse> {
    return this.request<HintResponse>(`/missions/${encodeURIComponent(missionId)}/hint`, {
      method: 'POST',
      body: JSON.stringify({ analysisId }),
    });
  }

  async submitMission(
    missionId: string,
    payload: SubmitRequest & { analysisId: string; sessionToken?: string }
  ): Promise<MissionFeedback> {
    const data = await this.request<{ feedback: MissionFeedback }>(
      `/missions/${encodeURIComponent(missionId)}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          sessionToken: this.getSessionToken(),
        }),
      }
    );
    return data.feedback;
  }

  async getDashboardRepos(): Promise<DashboardRepo[]> {
    const data = await this.request<{ repositories: DashboardRepo[] }>('/sessions/me/dashboard');
    return data.repositories;
  }
}
