import React from "react";
import { 
  Check, 
  X, 
  AlertTriangle, 
  ArrowRight, 
  Calendar,
  Database,
  Clock 
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

// Define the ApiCardProps type
interface ApiCardProps {
  api: {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    status: "running" | "stopped" | "degraded";
    environment: "production" | "qa" | "development";
    version: string;
    deprecated: boolean;
    cached?: boolean;
    lastUpdatedDate: string;
    businessFunction: string;
  };
  onViewDetails?: (id: string) => void;
}

// Map API status to appropriate UI elements
const statusConfig = {
  running: {
    icon: <Check className="h-4 w-4" />,
    color: "bg-green-400/10 text-green-400 hover:bg-green-400/20",
    text: "Running"
  },
  stopped: {
    icon: <X className="h-4 w-4" />,
    color: "bg-red-400/10 text-red-400 hover:bg-red-400/20",
    text: "Stopped"
  },
  degraded: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20",
    text: "Degraded"
  }
};

// Map environment to badge style
const environmentConfig = {
  production: "bg-green-50 text-green-600 border-green-200",
  qa: "bg-orange-50 text-orange-600 border-orange-200",
  development: "bg-blue-50 text-blue-600 border-blue-200"
};

export function ApiCard({ api, onViewDetails }: ApiCardProps) {
  const { icon, color, text } = statusConfig[api.status];

  return (
    <Card className="overflow-hidden">      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="collection-title">{api.name}</CardTitle>
          <Badge 
            variant="outline" 
            className={`stats-badge ${environmentConfig[api.environment]}`}
          >
            {api.environment}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-2">        <div className="mb-4">
          <p className="collection-description text-muted-foreground line-clamp-2">{api.description}</p>
        </div>
        <div className="text-muted-foreground mb-4">
          <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">
            {api.endpoint}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center gap-1">
            <Badge className={`w-fit px-2 py-0.5 ${color}`}>
              <span className="flex items-center gap-1">
                {icon} {text}
              </span>
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">v{api.version}</span>
              {api.deprecated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive" className="px-1 py-0">Deprecated</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This API is deprecated and will be removed in a future release.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Database className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">{api.businessFunction}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs">Updated: {api.lastUpdatedDate}</span>
          </div>
          
          {api.cached && (
            <div className="col-span-2 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-blue-50 text-blue-500 hover:bg-blue-100 border-blue-200">
                      Cached
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This API uses a caching layer for improved performance.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>      <CardFooter className="pt-2 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="view-button ml-auto flex items-center gap-1"
          onClick={() => onViewDetails && onViewDetails(api.id)}
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
