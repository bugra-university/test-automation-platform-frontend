import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, Loader2, User, Sparkles, Upload, PenLine, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/UseToast";
import { ProjectsTable } from "../../Shared/Tables/ProjectsTable";
import AlertDelete from "../Alert/AlertDelete";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";

interface ProjectsTabProps {
    onProjectSelect: (project: Project) => void;
    loadProjectExcelAndSwitchTab?: (project: Project) => Promise<void>;
    tabTitle?: string;
}

export function ProjectsTab({ onProjectSelect, loadProjectExcelAndSwitchTab, tabTitle = "All Projects" }: ProjectsTabProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            setError(null);
            const data = await projectsApi.getProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading projects:', error);
            setError('Error loading projects');
            setProjects([]);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: "Error",
                description: "Project name is required"
            });
            return;
        }

        try {
            setLoading(true);
            await projectsApi.createProject(formData);
            toast({
                title: "Success",
                description: "Project created successfully"
            });
            setFormData({ name: '', description: '' });
            setShowCreateForm(false);
            loadProjects();
        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                title: "Error",
                description: "Error creating project"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setShowDeleteAlert(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            setIsDeleting(true);
            await projectsApi.deleteProject(projectToDelete.id);
            toast({
                title: "Success",
                description: "Project deleted successfully"
            });
            setShowDeleteAlert(false);
            setProjectToDelete(null);
            loadProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast({
                title: "Error",
                description: "Error deleting project"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeleteProject = () => {
        setShowDeleteAlert(false);
        setProjectToDelete(null);
    };

    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setEditFormData({ name: project.name, description: project.description || '' });
        setShowEditForm(true);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectToEdit || !editFormData.name.trim()) {
            toast({
                title: "Error",
                description: "Project name is required"
            });
            return;
        }

        try {
            setIsUpdating(true);
            await projectsApi.updateProject(projectToEdit.id, editFormData);
            toast({
                title: "Success",
                description: "Project updated successfully"
            });
            setShowEditForm(false);
            setProjectToEdit(null);
            setEditFormData({ name: '', description: '' });
            loadProjects();
        } catch (error) {
            console.error('Error updating project:', error);
            toast({
                title: "Error",
                description: "Error updating project"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const cancelEditProject = () => {
        setShowEditForm(false);
        setProjectToEdit(null);
        setEditFormData({ name: '', description: '' });
    };

    if (loadingProjects) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading projects...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={loadProjects} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white h-full flex flex-col">
            {/* Header Section */}
            <div className="flex justify-between items-center h-[72px] px-8">
                <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-900">{tabTitle}</h1>
                </div>
                <div className="flex gap-3 items-center">
                    <Button variant="outline" className="gap-2 rounded-lg w-[150px]">
                        Quick Import
                    </Button>
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2 rounded-lg w-[150px] bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            </div>

            {/* Divider after header */}
            <div className="border-t border-gray-200"></div>

            {/* Content Container with padding */}
            <div className="px-8 flex-1">
                {/* Welcome Message */}
                <div className="pt-8">
                    <span className="text-lg font-semibold text-gray-700 block">Welcome to Test Management</span>
                    <span className="text-[16px] text-gray-600 block">Get started by using one of the actions below</span>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Action Cards */}
                <div className="grid grid-cols-2 gap-8 pb-8">
                    {/* First Row */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease-in-out',
                        transform: 'translateY(0)',
                    }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => setShowCreateForm(true)}>
                        <div style={{ padding: '12px', backgroundColor: '#EBF5FF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <Plus style={{ height: '28px', width: '28px', color: '#2563eb' }} strokeWidth={1.5} />
                        </div>
                        <div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827', display: 'block', marginBottom: '4px' }}>
                                Create a New Project →
                            </span>
                            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#6b7280', margin: '0' }}>Start from a clean slate and add data through CSV import</p>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease-in-out',
                        transform: 'translateY(0)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ padding: '12px', backgroundColor: '#EBF5FF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <FolderKanban style={{ height: '28px', width: '28px', color: '#2563eb' }} strokeWidth={1.5} />
                        </div>
                        <div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827', display: 'block', marginBottom: '4px' }}>
                                Import from TestRail, Zephyr Scale, qTest or Xray →
                            </span>
                            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#6b7280', margin: '0' }}>Start migrating data from your existing tool to Test Management</p>
                        </div>
                    </div>

                    {/* Second Row */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease-in-out',
                        transform: 'translateY(0)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ padding: '12px', backgroundColor: '#EBF5FF', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <User style={{ height: '28px', width: '28px', color: '#2563eb' }} strokeWidth={1.5} />
                        </div>
                        <div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827', display: 'block', marginBottom: '4px' }}>
                                Explore the Demo Project →
                            </span>
                            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#6b7280', margin: '0' }}>View the demo project to explore features of Test Management</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search projects by title/ID"
                            className="w-full px-4 py-1.5 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Projects Table Section */}
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="mt-6">
                        <ProjectsTable 
                            projects={projects} 
                            onProjectSelect={loadProjectExcelAndSwitchTab || onProjectSelect}
                            onDeleteProject={handleDeleteProject}
                            onEditProject={handleEditProject}
                        />
                    </div>
                )}
            </div>

            {showCreateForm && (
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-sm placeholder:text-gray-400"
                                    placeholder="Enter project name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-sm placeholder:text-gray-400"
                                    placeholder="Enter project description"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Project'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {showEditForm && projectToEdit && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-md font-medium text-gray-600 mb-3">Edit Project</h3>
                    <form onSubmit={handleUpdateProject} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter project name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-sm placeholder:text-gray-400"
                                placeholder="Enter project description"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Project'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelEditProject}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <AlertDelete
                isOpen={showDeleteAlert}
                onClose={cancelDeleteProject}
                onConfirm={confirmDeleteProject}
                title={projectToDelete?.name || ""}
                isDeleting={isDeleting}
            />
        </div>
    );
}
