import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, Loader2, Search } from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/UseToast";

interface ProjectsTabProps {
    onProjectSelect: (project: Project) => void;
}

export function ProjectsTab({ onProjectSelect }: ProjectsTabProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const fetchedProjects = await projectsApi.getProjects();
            setProjects(fetchedProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (err: any) {
            console.error('Error loading projects:', err);
            setError('Failed to load projects.');
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Project name is required.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const newProject = await projectsApi.createProject({
                name: formData.name.trim(),
                description: formData.description.trim()
            });
            setProjects(prev => [newProject, ...prev]);
            setShowCreateForm(false);
            setFormData({ name: '', description: '' });
            toast({ title: "Success", description: "Project created successfully." });
        } catch (err: any) {
            setError(err.message ?? 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loadingProjects) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 h-full">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Projects</h1>
                <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <Button onClick={() => setShowCreateForm(true)}><Plus className="mr-2 h-4 w-4" /> New Project</Button>
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {showCreateForm && (
                <form onSubmit={handleCreateProject} className="mb-4 p-4 border rounded bg-gray-50">
                    <h2 className="text-lg font-semibold mb-2">Create New Project</h2>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <textarea
                            placeholder="Project Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map(project => (
                    <div
                        key={project.id}
                        onClick={() => onProjectSelect(project)}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                        <div className="flex items-center">
                            <FolderKanban className="h-6 w-6 mr-3 text-blue-500" />
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 truncate">{project.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
