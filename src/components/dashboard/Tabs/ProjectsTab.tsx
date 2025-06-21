import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, Loader2 } from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";
import { Button } from "../../ui/button";
import { useToast } from "../../ui/UseToast";
import { ProjectsTable } from "../../Shared/Tables/ProjectsTable";

interface ProjectsTabProps {
    onProjectSelect: (project: Project) => void;
}

export function ProjectsTab({ onProjectSelect }: ProjectsTabProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
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
            setError(null);
            const data = await projectsApi.getProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading projects:', error);
            setError('Projeler yüklenirken hata oluştu');
            setProjects([]);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: "Hata",
                description: "Proje adı gerekli"
            });
            return;
        }

        try {
            setLoading(true);
            await projectsApi.createProject(formData);
            toast({
                title: "Başarılı",
                description: "Proje başarıyla oluşturuldu"
            });
            setFormData({ name: '', description: '' });
            setShowCreateForm(false);
            loadProjects();
        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                title: "Hata",
                description: "Proje oluşturulurken hata oluştu"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loadingProjects) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Projeler yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={loadProjects} variant="outline">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full bg-white h-full flex flex-col p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    <h2 className="text-lg font-semibold">Projeler</h2>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Proje
                </Button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <h3 className="text-md font-medium mb-3">Yeni Proje Oluştur</h3>
                    <form onSubmit={handleCreateProject} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proje Adı
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Proje adını girin"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Açıklama
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Proje açıklamasını girin"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Oluşturuluyor...
                                    </>
                                ) : (
                                    'Proje Oluştur'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateForm(false)}
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex-1">
                <ProjectsTable projects={projects} onProjectSelect={onProjectSelect} />
            </div>
        </div>
    );
}
