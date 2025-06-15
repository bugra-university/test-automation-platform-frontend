import React from "react";
import { 
  ChevronRight, 
  Check, 
  X, 
  AlertTriangle,
  Truck, 
  Map, 
  Users, 
  Box, 
  BarChart4 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

// Define the API shape we expect
interface Api {
  id: string;
  name: string;
  description: string;
  status: "running" | "stopped" | "degraded";
  environment: "production" | "qa" | "development";
  deprecated: boolean;
}

interface ApiFamilyCardProps {
  familyId: string;
  familyName: string;
  apis: Api[];
  onViewFamily?: (familyId: string) => void;
}

// Map icon names to Lucide icon components
const iconMap: Record<string, React.ReactNode> = {
  truck: <Truck className="h-5 w-5" />,
  map: <Map className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  box: <Box className="h-5 w-5" />,
  chart: <BarChart4 className="h-5 w-5" />,
};

const statusIcons = {
  running: <Check className="h-3 w-3 text-green-500" />,
  stopped: <X className="h-3 w-3 text-red-500" />,
  degraded: <AlertTriangle className="h-3 w-3 text-yellow-500" />,
};

export function ApiFamilyCard({ familyId, familyName, apis, onViewFamily }: ApiFamilyCardProps) {
  // Extract stats from the APIs
  const totalApis = apis.length;
  const runningApis = apis.filter(api => api.status === "running").length;
  const productionApis = apis.filter(api => api.environment === "production").length;
  const deprecatedApis = apis.filter(api => api.deprecated).length;
  
  // Determine the icon to use
  const icon = iconMap[familyId.includes("fleet") ? "truck" : 
               familyId.includes("logistics") ? "map" : 
               familyId.includes("customer") ? "users" : "box"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">            <div className="bg-primary/10 p-2 rounded-md">
              {icon}
            </div>
            <CardTitle className="collection-title">{familyName}</CardTitle>
          </div>
          <Badge variant="outline" className="stats-badge bg-primary/5">
            {totalApis} APIs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm my-2">
          {apis.slice(0, Math.min(4, apis.length)).map(api => (
            <div key={api.id} className="flex items-center gap-2">
              {statusIcons[api.status]}
              <span className="truncate" title={api.name}>{api.name}</span>
            </div>
          ))}
        </div>
        {apis.length > 4 && (
          <CardDescription className="mt-1 text-xs">
            +{apis.length - 4} more APIs
          </CardDescription>
        )}
        <div className="flex flex-wrap gap-2 mt-4">          <Badge variant="outline" className="stats-badge bg-green-50 text-green-600 border-green-200">
            {runningApis} Running
          </Badge>
          <Badge variant="outline" className="stats-badge bg-blue-50 text-blue-600 border-blue-200">
            {productionApis} Production
          </Badge>
          {deprecatedApis > 0 && (
            <Badge variant="outline" className="stats-badge bg-amber-50 text-amber-600 border-amber-200">
              {deprecatedApis} Deprecated
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">        <Button 
          variant="ghost" 
          size="sm" 
          className="view-button ml-auto flex items-center gap-1"
          onClick={() => onViewFamily && onViewFamily(familyId)}
        >
          View APIs
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
