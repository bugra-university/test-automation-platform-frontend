import React, { useState, useEffect } from "react";
import { 
  Plus, 
  FolderKanban, 
  User, 
  Loader2,
  FileSpreadsheet,
  PlayCircle,
  Settings,
  BarChart3,
  Upload,
  Eye,
  EyeOff,
  Clock,
  Search,
  MoreHorizontal,
  Star,
  Activity
} from "lucide-react";
import { projectsApi, type Project } from "../../../api/projectsApi";

// Mock data for demonstration
const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: "E-Commerce Testing Suite",
    description: "Comprehensive test suite for e-commerce platform including UI, API, and performance tests",
    owner_id: 1,
    owner_username: "testuser",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2024-01-15T14:30:00Z"
  },
  {
    id: 2,
    name: "Mobile App QA",
    description: "End-to-end testing for iOS and Android mobile applications",
    owner_id: 1,
    owner_username: "testuser",
    created_at: "2023-11-15T09:15:00Z",
    updated_at: "2024-01-10T11:45:00Z"
  },
  {
    id: 3,
    name: "Payment Gateway Tests",
    description: "Security and functional testing for payment processing system",
    owner_id: 1,
    owner_username: "testuser",
    created_at: "2023-10-20T16:20:00Z",
    updated_at: "2024-01-05T08:30:00Z"
  }
];

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'public' | 'private'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setError(null);
      const fetchedProjects = await projectsApi.getProjects();
      setProjects(fetchedProjects);
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
      // Fallback to mock data if API fails
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create project using real API
      const newProject = await projectsApi.createProject({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      setProjects(prev => [newProject, ...prev]);
      setFormData({ name: '', description: '', visibility: 'private' });
      setSelectedFile(null);
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
    } else {
      setError('Please select a valid Excel file (.xlsx)');
    }
  };
  const getProjectStats = (projectId: number) => {
    // Mock statistics - would come from API in real implementation
    return {
      testCases: Math.floor(Math.random() * 150) + 20,
      testRuns: Math.floor(Math.random() * 50) + 5,
      lastActivity: Math.floor(Math.random() * 30) + 1
    };
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* GitHub-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">Manage your test projects and upload Excel files</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
              
              {/* Create Project Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Test Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + getProjectStats(project.id).testCases, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Test Runs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + getProjectStats(project.id).testRuns, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>        {/* Projects Grid */}
        {loadingProjects ? (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading projects...</h3>
            <p className="text-gray-600">Please wait while we fetch your projects</p>
          </div>
        ) : error && projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadProjects}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project.id);
              return (
                <div
                  key={project.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <FolderKanban className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer">
                        {project.name}
                      </h3>
                    </div>
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FileSpreadsheet className="h-3 w-3 mr-1" />
                        {stats.testCases} tests
                      </span>
                      <span className="flex items-center">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        {stats.testRuns} runs
                      </span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {project.owner_username}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {stats.lastActivity}d ago
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </button>
                    </div>
                    <div className="flex space-x-1">                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Star project"
                        aria-label="Star project"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Project settings"
                        aria-label="Project settings"
                      >
                        <Settings className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderKanban className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No projects match "${searchTerm}". Try a different search term.`
                : 'Get started by creating your first test project'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal - GitHub Style */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create a new project</h2>
              <p className="text-gray-600 text-sm mt-1">
                A project contains test cases, test runs, and configuration files.
              </p>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-6">
                {/* Owner Section */}                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Owner
                  </span>
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 font-medium">testuser</span>
                    <span className="text-gray-500 ml-2">(current user)</span>
                  </div>
                </div>

                {/* Project Name */}
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                    Project name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="my-awesome-project"
                    disabled={loading}
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Great project names are short and memorable.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="projectDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="A brief description of your project"
                    disabled={loading}
                    required
                  />
                </div>                {/* Visibility */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-3">
                    Visibility
                  </legend>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <input
                        type="radio"
                        id="public"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                        disabled={loading}
                      />
                      <div className="ml-3">
                        <label htmlFor="public" className="block text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            Public
                          </div>
                        </label>
                        <p className="text-gray-500 text-xs">
                          Anyone in your organization can see this project.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <input
                        type="radio"
                        id="private"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                        disabled={loading}
                      />
                      <div className="ml-3">
                        <label htmlFor="private" className="block text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <EyeOff className="h-4 w-4 mr-2" />
                            Private
                          </div>
                        </label>                        <p className="text-gray-500 text-xs">
                          Only you can see this project.
                        </p>
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Initialize with Excel File */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Initialize this project with:
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          disabled={loading}
                        />
                        <span className="ml-2 text-sm text-gray-700">Add a README file</span>
                      </label>
                      <p className="text-gray-500 text-xs mt-1 ml-6">
                        This is where you can write a long description for your project.
                      </p>
                    </div>
                      <div>
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Excel file (optional)
                      </span>                      <div className="relative">
                        <label htmlFor="excel-upload" className="sr-only">Upload Excel file</label>
                        <input
                          id="excel-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                          disabled={loading}
                        />
                        {selectedFile && (
                          <p className="text-green-600 text-xs mt-1">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        Upload test cases from an Excel file to get started quickly.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError(null);
                  setFormData({ name: '', description: '', visibility: 'private' });
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={loading || !formData.name.trim() || !formData.description.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
