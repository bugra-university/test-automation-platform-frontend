import React from 'react';
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "../../Shared/DropDown/DropdownMenu";
import { Download, MoreVertical, Eye } from "lucide-react";

interface ReportCardProps {
  title: string;
  generatedDate: string;
  description: string;
  fileType: "HTML" | "PDF" | "CSV";
  onView: () => void;
  onDownload: () => void;
}

const getFileTypeBadgeStyle = (fileType: ReportCardProps['fileType']) => {
  switch (fileType) {
    case 'HTML':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'PDF':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'CSV':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    default:
      return '';
  }
};

export function ReportCard({ title, generatedDate, description, fileType, onView, onDownload }: ReportCardProps) {
  return (
    <div className="p-4 border rounded-md hover:border-primary hover:shadow-sm transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download {fileType}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Generated: {generatedDate}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge className={getFileTypeBadgeStyle(fileType)}>{fileType}</Badge>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        <Button size="sm" variant="outline" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
