import React from 'react';
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

interface ScheduleCardProps {
  title: string;
  schedule: string;
  status: 'active' | 'paused';
  onEdit?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  title,
  schedule,
  status,
  onEdit
}) => {
  return (
    <div className="p-4 border rounded-md hover:border-primary hover:shadow-sm transition-all">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{schedule}</p>
      <div className="flex justify-between mt-3">
        <Badge 
          variant="outline" 
          className={status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}
        >
          {status === 'active' ? 'Active' : 'Paused'}
        </Badge>
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
};

export default ScheduleCard;
