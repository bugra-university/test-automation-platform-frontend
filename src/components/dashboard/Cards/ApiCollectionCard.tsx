import React from "react";
import { ChevronRight, Truck, Map, Users, Box, BarChart4 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

interface ApiCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  apis: string[];
}

interface ApiCollectionWithStats {
  collection: ApiCollection;
  apiCount: number;
  environments: {
    production: number;
    development: number;
    qa: number;
  };
  issues: {
    stopped: number;
    deprecated: number;
  };
}

interface ApiCollectionCardProps {
  collectionWithStats: ApiCollectionWithStats;
  onViewCollection?: (collectionId: string) => void;
}

// Map icon names to Lucide icon components
const iconMap: Record<string, React.ReactNode> = {
  truck: <Truck className="h-5 w-5" />,
  map: <Map className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  box: <Box className="h-5 w-5" />,
  chart: <BarChart4 className="h-5 w-5" />,
};

export function ApiCollectionCard({ collectionWithStats, onViewCollection }: ApiCollectionCardProps) {
  const { collection, apiCount, environments, issues } = collectionWithStats;
  
  // Determine the icon to use
  const icon = iconMap[collection.icon] || iconMap.box;
  
  // Calculate the total issues
  const totalIssues = issues.stopped + issues.deprecated;

  return (
    <Card className="overflow-hidden">      <CardHeader className="bg-muted/50 pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-md">
            {icon}
          </div>
          <div>
            <CardTitle className="collection-title">{collection.name}</CardTitle>
            <p className="collection-description text-muted-foreground mt-1">{collection.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>            <h4 className="env-label text-sm font-medium mb-2">Environments</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="stats-badge bg-green-50 text-green-600 border-green-200">
                Production: {environments.production}
              </Badge>
              <Badge variant="outline" className="stats-badge bg-orange-50 text-orange-600 border-orange-200">
                QA: {environments.qa}
              </Badge>
              <Badge variant="outline" className="stats-badge bg-blue-50 text-blue-600 border-blue-200">
                Development: {environments.development}
              </Badge>
            </div>
          </div>
          <div>
            <h4 className="issue-label text-sm font-medium mb-2">Issues</h4>
            {totalIssues > 0 ? (
              <div className="flex flex-wrap gap-2">
                {issues.stopped > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    Stopped: {issues.stopped}
                  </Badge>
                )}
                {issues.deprecated > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                    Deprecated: {issues.deprecated}
                  </Badge>
                )}
              </div>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                No issues
              </Badge>
            )}
          </div>
        </div>
      </CardContent>      <CardFooter className="pt-2 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="view-button ml-auto flex items-center gap-1"
          onClick={() => onViewCollection && onViewCollection(collection.id)}
        >
          View APIs ({apiCount})
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
