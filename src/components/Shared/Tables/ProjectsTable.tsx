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
// Projects table specific styles
import "../../../styles/dashboard/excel-viewer/projects-table.css";
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
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  FolderKanban,
  User,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Project } from "../../../api/projectsApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

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

// Status classes are now handled in CSS

const createColumns = (onDeleteProject?: (project: Project) => void, onEditProject?: (project: Project) => void): ColumnDef<Project>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="projects-regular-checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="projects-regular-checkbox"
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
        <span className="projects-header-text">PROJECT NAME</span>
      </div>
    ),
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="projects-cell-name">
        {row.getValue("name")}
      </div>
    ),
    size: 250,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span className="projects-header-text">DESCRIPTION</span>
      </div>
    ),
    accessorKey: "description",
    cell: ({ row }) => (
      <div className="projects-cell-description">
        {row.getValue("description") || "No description"}
      </div>
    ),
    size: 300,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span className="projects-header-text">CREATED DATE</span>
      </div>
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="projects-cell-date">
        {formatDate(row.getValue("createdAt"))}
      </div>
    ),
    size: 150,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span className="projects-header-text">TEST CASES</span>
      </div>
    ), 
    accessorKey: "testCases",
    cell: ({ row }) => {
      const testCases = row.original.name === "testv1" ? "98 Cases | 5 Test Runs" : "156 Cases | 12 Test Runs";
      return (
        <div className="projects-cell-test-cases">
          {testCases}
        </div>
      );
    },
    size: 200,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span className="projects-header-text">STATUS</span>
      </div>
    ),
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string || "Active";
      const statusClass = `projects-status-${status.toLowerCase()}`;
      return (
        <div className="projects-cell-actions">
          <span className={`projects-status-badge ${statusClass}`}>
            {status}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    header: ({ column }) => (
      <div className="header-content">
        <span className="projects-header-text">ACTIONS</span>
      </div>
    ),
    id: "actions",
    cell: ({ row }) => (
      <div className="projects-cell-actions">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="projects-action-button">
              <MoreVertical className="projects-action-icon" strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="projects-dropdown-item"
              onClick={(e) => {
                e.stopPropagation();
                onEditProject?.(row.original);
              }}
            >
              <Pencil className="projects-dropdown-icon" strokeWidth={1.5} />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="projects-dropdown-item projects-dropdown-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject?.(row.original);
              }}
            >
              <Trash2 className="projects-dropdown-icon" strokeWidth={1.5} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="bg-gray-50 py-2 h-8"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onProjectSelect(row.original)}
                  className={`cursor-pointer hover:bg-gray-50 ${index > 0 ? 'bg-gray-100' : ''} h-10`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="py-1"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center text-sm"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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