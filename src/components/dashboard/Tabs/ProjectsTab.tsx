import React, { useState, useEffect } from "react";
import { Plus, FolderKanban, User, Calendar, Loader2 } from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Load projects on component mount - DISABLED until backend is ready
  useEffect(() => {
    // loadProjects(); // Temporarily disabled to prevent 403 errors
    setLoadingProjects(false); // Set to false to show empty state
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const fetchedProjects = await projectsApi.getProjects();
      setProjects(fetchedProjects);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all fields');
      return;
    }    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with real API call when backend is ready
      // const newProject = await projectsApi.createProject(formData);
      
      // Simulate API response for now
      const newProject = {
        id: Date.now(), // Use timestamp as fake ID
        name: formData.name,
        description: formData.description,
        owner_id: 1,
        owner_username: 'testuser',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProjects(prev => [newProject, ...prev]);
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-white h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Create and manage your test projects</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Project
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="projectDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project"
                  disabled={loading}
                />
              </div>              <div className="mb-6">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Owner
                </span>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">testuser (current user)</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Projects List */}
      <div className="flex-1">
        {(() => {
          if (loadingProjects) {
            return (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading projects...</h3>
                <p className="text-gray-600">Please wait while we fetch your projects</p>
              </div>
            );
          }
          
          if (error) {
            return (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
                <p className="text-gray-600 mb-4">{error}</p>                <button
                  onClick={() => {
                    setError(null);
                    setLoadingProjects(false);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Error
                </button>
              </div>
            );
          }
            if (projects.length === 0) {
            return (
              <div className="text-center py-12">
                <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first project</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Project
                </button>
              </div>
            );
          }
          
          return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FolderKanban className="h-8 w-8 text-blue-600" />
                    <span className="text-xs text-gray-500">#{project.id}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {project.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {project.owner_username}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
