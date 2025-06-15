import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";

interface TestSuiteCardProps {
  title: string;
  testCount: number;
  progress?: number;
  stats: {
    passed: number;
    failed?: number;
    skipped?: number;
  };
  environments?: {
    chrome?: number;
    firefox?: number;
    safari?: number;
  };
  onViewAll: () => void;
}

const getEnvironmentBadgeStyle = (env: string) => {
  switch (env.toLowerCase()) {
    case 'chrome':
      return 'bg-green-50 text-green-600';
    case 'firefox':
      return 'bg-orange-50 text-orange-600';
    case 'safari':
      return 'bg-blue-50 text-blue-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export function TestSuiteCard({ 
  title, 
  testCount, 
  progress = 85,
  stats, 
  environments,
  onViewAll 
}: TestSuiteCardProps) {
  return (
    <div className="p-4 border rounded-md hover:border-primary hover:shadow-sm transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{testCount} tests</p>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-full" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {stats.passed > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-600">
            {stats.passed} Passed
          </Badge>
        )}
        {stats.failed && stats.failed > 0 && (
          <Badge variant="outline" className="bg-red-50 text-red-600">
            {stats.failed} Failed
          </Badge>
        )}
        {stats.skipped && stats.skipped > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-600">
            {stats.skipped} Skipped
          </Badge>
        )}
      </div>

      {environments && Object.entries(environments).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(environments).map(([env, count]) => (
            count > 0 && (
              <Badge 
                key={env}
                variant="outline" 
                className={getEnvironmentBadgeStyle(env)}
              >
                {env}: {count}
              </Badge>
            )
          ))}
        </div>
      )}
    </div>
  );
}
