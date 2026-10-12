import { useNavigate } from 'react-router-dom';
import { DashboardRepo } from '../../types';
import { Button } from '../ui/Button';
import {
  GitFork,
  Star,
  Clock,
  ArrowRight,
  Target,
  FileCode,
  ShieldCheck,
} from 'lucide-react';

interface RepoCardProps {
  item: DashboardRepo;
  onDelete?: (id: string) => void;
}

export function RepoCard({ item }: RepoCardProps) {
  const navigate = useNavigate();
  const { repository, missionsCompleted, missionsTotal, lastExplored } = item;

  const handleOpen = () => {
    navigate(`/investigation/${repository.id}`);
  };

  const progressPercent =
    missionsTotal > 0 ? Math.round((missionsCompleted / missionsTotal) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-surface-primary hover:border-text-muted/40 transition-all p-5 flex flex-col justify-between group shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-semibold text-text-primary text-base group-hover:text-accent-blue transition-colors font-mono">
              {repository.fullName}
            </h3>
            <p className="text-body-xs text-text-secondary line-clamp-2 mt-1">
              {repository.description}
            </p>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
            {repository.language}
          </span>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {repository.detectedTechnologies.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Missions progress bar */}
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-body-xs text-text-secondary mb-1.5">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-accent-amber" />
              <span>Missions Progress</span>
            </span>
            <span className="font-mono text-text-primary font-medium">
              {missionsCompleted} / {missionsTotal} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-amber rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 text-body-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {repository.stars}
          </span>
          <span className="flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5" />
            {repository.fileCount} files
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lastExplored}
          </span>
        </div>

        <Button variant="secondary" size="sm" onClick={handleOpen}>
          <span>Resume</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
