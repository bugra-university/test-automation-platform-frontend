import { Database, Clock, BarChart4, Layers } from "lucide-react";

interface CachedExplanationProps {
  cacheInfo?: {
    cacheLocation?: {
      dev: string;
      prod: string;
    };
    cacheStructure?: string;
  };
}

export function CachedExplanation({ cacheInfo }: CachedExplanationProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Cached API</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        This API implements caching to improve performance and reduce database load.
        Responses may be served from cache based on request parameters and freshness settings.
      </p>

      <div className="space-y-4">
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Cache Benefits
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Reduced response times for frequently accessed data</li>
            <li>Lower load on backend databases and services</li>
            <li>Improved scalability during high traffic periods</li>
          </ul>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <BarChart4 className="h-4 w-4" /> Implementation Details
          </h4>

          {cacheInfo ? (
            <div className="space-y-3">
              {cacheInfo.cacheLocation && (
                <div>
                  <h5 className="text-xs font-semibold">Cache Location:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Production: {cacheInfo.cacheLocation.prod}</li>
                    <li>Development: {cacheInfo.cacheLocation.dev}</li>
                  </ul>
                </div>
              )}

              {cacheInfo.cacheStructure && (
                <div>
                  <h5 className="text-xs font-semibold">Cache Structure:</h5>
                  <p className="text-sm">{cacheInfo.cacheStructure}</p>
                </div>
              )}
            </div>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Redis-based caching implementation</li>
              <li>Configurable time-to-live (TTL) settings</li>
              <li>Cache invalidation on resource updates</li>
            </ul>
          )}
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Database className="h-4 w-4" /> Developer Notes
          </h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Use appropriate cache-control headers in requests</li>
            <li>Add <code className="bg-muted-foreground/20 px-1 rounded">no-cache</code> header to force fresh data</li>
            <li>Check API documentation for specific cache behaviors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
