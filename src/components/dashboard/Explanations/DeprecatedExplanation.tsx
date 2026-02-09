import { AlertOctagon, ArrowRight, Clock, Calendar } from "lucide-react";

interface DeprecatedExplanationProps {
  apiInfo?: {
    name?: string;
    version?: string;
    deprecatedSince?: string;
    endOfLifeDate?: string;
    replacementApi?: {
      name: string;
      version: string;
      endpoint: string;
    };
  };
}

export function DeprecatedExplanation({ apiInfo }: DeprecatedExplanationProps) {
  // Default values for missing info
  const name = apiInfo?.name || "This API";
  const version = apiInfo?.version || "current version";
  const deprecatedSince = apiInfo?.deprecatedSince || "a previous release";
  const endOfLifeDate = apiInfo?.endOfLifeDate || "a future release";

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertOctagon className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Deprecated API</h3>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-md mb-4">
        <p className="text-sm">
          <strong>Warning:</strong> {name} v{version} has been deprecated since {deprecatedSince} and
          will be removed in {endOfLifeDate}. Please transition to the replacement API as soon as possible.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" /> What does deprecation mean?
          </h4>
          <p className="text-sm text-muted-foreground">
            A deprecated API is still functional but no longer recommended for use. It receives no new features
            and only critical bug fixes or security updates. Eventually, it will be removed completely.
          </p>
        </div>

        <div className="bg-muted/50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Deprecation Timeline
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deprecation Notice:</span>
              <span className="font-medium">{deprecatedSince}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>End of Support:</span>
              <span className="font-medium">{endOfLifeDate}</span>
            </div>
          </div>
        </div>

        {apiInfo?.replacementApi && (
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" /> Replacement API
            </h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{apiInfo.replacementApi.name}</span> v{apiInfo.replacementApi.version}
              </div>
              <div className="text-xs">
                <code className="bg-muted px-1 py-0.5 rounded font-mono">
                  {apiInfo.replacementApi.endpoint}
                </code>
              </div>
              <div className="pt-1">
                <a
                  href="#"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View migration guide
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
