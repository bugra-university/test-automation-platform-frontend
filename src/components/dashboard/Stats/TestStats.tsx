import React from 'react';
import { Badge } from '../../ui/badge';

interface TestStatsProps {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  pendingTests: number;
}

export const TestStats: React.FC<TestStatsProps> = ({
  totalTests,
  passedTests,
  failedTests,
  skippedTests,
  pendingTests
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="stats-badge px-2 py-0.5 text-xs rounded-full text-muted-foreground">
        Total Tests: {totalTests}
      </Badge>
      <Badge variant="outline" className="stats-badge px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-600">
        Passed: {passedTests}
      </Badge>
      <Badge variant="outline" className="stats-badge px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-600">
        Failed: {failedTests}
      </Badge>
      <Badge variant="outline" className="stats-badge px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600">
        Skipped: {skippedTests}
      </Badge>
      <Badge variant="outline" className="stats-badge px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">
        Pending: {pendingTests}
      </Badge>
    </div>
  );
};
