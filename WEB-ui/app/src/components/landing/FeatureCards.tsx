import { Network, Search, Award, Code2 } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}

function FeatureCard({ icon, title, description, accent }: FeatureCardProps) {
  return (
    <div className="relative group rounded-xl border border-border bg-surface-primary/80 backdrop-blur-sm p-5 hover:border-text-muted/40 transition-all duration-200">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-text-primary text-base mb-1.5">{title}</h3>
      <p className="text-body-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: <Network className="w-5 h-5" />,
      title: 'Architecture Graph',
      description: 'Interactive file dependency visualization with verified JavaScript and TypeScript imports.',
      accent: '#5B8CFF',
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Evidence-Backed Missions',
      description: 'Solve real engineering scenarios by pinpointing exact code citations and architectural flows.',
      accent: '#F4BD58',
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: 'Source Inspector',
      description: 'Inspect full file contents in a read-only code viewer with highlighted citations.',
      accent: '#39D6A0',
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Actionable Feedback',
      description: 'Instant verification of your findings with clear pass, fail, or partial evaluations.',
      accent: '#A78BFA',
    },
  ];

  return (
    <div className="w-full mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feat) => (
        <FeatureCard key={feat.title} {...feat} />
      ))}
    </div>
  );
}
