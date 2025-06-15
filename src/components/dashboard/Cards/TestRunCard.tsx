import React from 'react';
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";

interface TestRunCardProps {
  title: string;
  lastRun: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  progress?: number;
  stats?: {
    passed: number;
    failed: number;
    running?: number;
  };
  onViewDetails: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-50 text-green-600';
    case 'IN_PROGRESS':
      return 'bg-blue-50 text-blue-600';
    case 'FAILED':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export function TestRunCard({ title, lastRun, status, progress, stats, onViewDetails }: TestRunCardProps) {
  return (
    <div className="p-4 border rounded-md hover:border-primary hover:shadow-sm transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">Last run: {lastRun}</p>
        </div>
        <Badge variant="outline" className={getStatusColor(status)}>
          {status}
        </Badge>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Progress 
              value={progress} 
              className={`w-full ${status === 'FAILED' ? '!bg-red-100 !text-red-500' : ''}`} 
            />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>
      )}

      {stats && (
        <div className="flex flex-wrap gap-1 mt-3">
          {stats.passed > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-600">
              {stats.passed} Passed
            </Badge>
          )}
          {stats.failed > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-600">
              {stats.failed} Failed
            </Badge>
          )}
          {stats.running && stats.running > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-600">
              {stats.running} Running
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4">
        <Button size="sm" variant="outline" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  );
}
