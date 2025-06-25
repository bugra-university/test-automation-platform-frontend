import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, Loader2 } from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/UseToast";
import { ProjectsTable } from "../../Shared/Tables/ProjectsTable";
import AlertDelete from "../Alert/AlertDelete";

interface ProjectsTabProps {
    onProjectSelect: (project: Project) => void;
    loadProjectExcelAndSwitchTab?: (project: Project) => Promise<void>;
}

export function ProjectsTab({ onProjectSelect, loadProjectExcelAndSwitchTab }: ProjectsTabProps) {
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
        <div className="w-full bg-white h-full flex flex-col p-8">
            <div className="flex items-center justify-end mb-6">
                <Button onClick={() => setShowCreateForm(true)} className="gap-2 rounded-lg">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-md font-medium text-gray-600 mb-3">Create New Project</h3>
                    <form onSubmit={handleCreateProject} className="space-y-3">
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
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Project'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
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

            <div className="flex-1">
                <ProjectsTable 
                    projects={projects} 
                    onProjectSelect={loadProjectExcelAndSwitchTab || onProjectSelect}
                    onDeleteProject={handleDeleteProject}
                    onEditProject={handleEditProject}
                />
            </div>

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
