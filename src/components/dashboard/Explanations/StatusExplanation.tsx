import { Check, X, AlertTriangle } from "lucide-react";

interface StatusExplanationProps {
  status: "running" | "stopped" | "degraded";
}

export function StatusExplanation({ status }: StatusExplanationProps) {
  const statusConfig = {
    running: {
      icon: <Check className="h-5 w-5 text-green-500" />,
      title: "Running",
      description: "This API is fully operational and responding to requests as expected.",
      details: [
        "All endpoints are available",
        "Response times are within expected ranges",
        "No known issues or limitations",
      ],
    },
    stopped: {
      icon: <X className="h-5 w-5 text-red-500" />,
      title: "Stopped",
      description: "This API is currently unavailable and not processing requests.",
      details: [
        "All endpoints are returning error responses",
        "May be due to maintenance or an unplanned outage",
        "Check the maintenance schedule or contact support",
      ],
    },
    degraded: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      title: "Degraded",
      description: "This API is operational but experiencing performance or functionality issues.",
      details: [
        "Some endpoints may be slower than usual",
        "Occasional errors might be encountered",
        "Technical team is working on resolving the issues",
      ],
    },
  };

  const { icon, title, description, details } = statusConfig[status];

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-lg font-semibold">{title} Status</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="bg-muted/50 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">What this means:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
