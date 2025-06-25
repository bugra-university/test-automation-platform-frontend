"use client";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Pagination, PaginationContent, PaginationItem } from "../../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
// Excel viewer styles for consistent look
import "../../../styles/dashboard/excel-viewer/index.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Project } from "../../../api/projectsApi";

interface ProjectsTableProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const createColumns = (onDeleteProject?: (project: Project) => void, onEditProject?: (project: Project) => void): ColumnDef<Project>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="regular-checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="regular-checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>PROJECT NAME</span>
      </div>
    ),
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="cell-content font-medium text-blue-600">
        {row.getValue("name")}
      </div>
    ),
    size: 250,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>DESCRIPTION</span>
      </div>
    ),
    accessorKey: "description",
    cell: ({ row }) => (
      <div className="cell-content text-gray-600">
        {row.getValue("description") || "No description"}
      </div>
    ),
    size: 300,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>CREATED DATE</span>
      </div>
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="cell-content text-gray-500">
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
    size: 150,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>UPDATED DATE</span>
      </div>
    ), 
    accessorKey: "updatedAt",
    cell: ({ row }) => (
      <div className="cell-content text-gray-500">
        {formatDate(row.getValue("updatedAt"))}
      </div>
    ),
    size: 150,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>STATUS</span>
      </div>
    ),
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string || "Active";
      return (
        <div className="cell-content">
          <Badge className={cn(getStatusBadgeClass(status))}>
            {status}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span>ACTIONS</span>
      </div>
    ),
    id: "actions",
    cell: ({ row }) => (
      <div className="cell-content">
        <div className="flex items-center justify-center gap-2">
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit project"
            onClick={(e) => {
              e.stopPropagation();
              onEditProject?.(row.original);
            }}
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete project"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProject?.(row.original);
            }}
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    ),
    size: 100,
    enableSorting: false,
  },
];

export function ProjectsTable({ projects, onProjectSelect, onDeleteProject, onEditProject }: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = createColumns(onDeleteProject, onEditProject);

  const table = useReactTable({
    data: projects,
    columns,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
  });

  const selectedRowsId = useId();

  return (
    <div className="space-y-4">
      <div className="table-container">
        <div className="table-scroll-container" style={{ borderRadius: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
          <table className="excel-table">
            <thead className="excel-table-header">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <th
                        key={header.id}
                        style={{ 
                          width: header.getSize(),
                          ...(index === 0 ? { borderTopLeftRadius: '0.5rem' } : {}),
                          ...(index === headerGroup.headers.length - 1 ? { borderTopRightRadius: '0.5rem' } : {})
                        }}
                        className={cn(
                          header.column.id === "select" ? "checkbox-column" : "",
                          header.column.getCanSort() && "cursor-pointer"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center justify-between">
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {header.column.getCanSort() && (
                              <div className="sort-indicator-container">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-3 w-3 sort-arrow" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-3 w-3 sort-arrow" />
                                ) : (
                                  <div className="sort-arrow-default">
                                    <ChevronUp className="h-3 w-3 default-arrow" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="excel-table-body">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      row.getIsSelected() && "selected-row",
                      "cursor-pointer"
                    )}
                    onClick={() => onProjectSelect(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={cn(
                          "content-cell",
                          cell.column.id === "select" ? "checkbox-column" : ""
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="content-cell text-center">
                    <div className="cell-content">No projects found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pagination-controls">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-normal text-gray-400">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs font-normal text-gray-400">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor={selectedRowsId} className="text-xs font-normal text-gray-400">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-xs font-normal text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronFirst className="h-5 w-5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-10 w-10 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronLast className="h-5 w-5" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
} 