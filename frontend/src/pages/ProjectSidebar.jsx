import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Plus, Trash2, RefreshCw, Play, Cloud, ChevronDown, CheckCircle, ExternalLink } from 'lucide-react';
import { getAllProjects, deleteProject, startBuild, startDeploy, getDeploymentStatuses } from '../api';
import AddProjectModal from './AddProjectModal';
import CloudCredentialsModal from './CloudCredentialsModal';

const ProjectSidebar = ({ selectedProject, setSelectedProject }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cloudModalOpen, setCloudModalOpen] = useState(false);
    const [selectedStoredUrl, setSelectedStoredUrl] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [buildingId, setBuildingId] = useState(null);
    const [deployingId, setDeployingId] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [projectsData, deploymentData] = await Promise.all([
                getAllProjects(),
                getDeploymentStatuses().catch(() => []) // Catching in case DeploymentService is unreachable initially
            ]);

            // Merge deployment status into projects using storedUrl
            const mergedProjects = (projectsData || []).map(p => {
                const deployStatus = (deploymentData || []).find(d => d.storedUrl === p.storedUrl);
                return { ...p, deploymentConfig: deployStatus };
            });

            setProjects(mergedProjects);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Polling mechanism for projects that are still processing
    useEffect(() => {
        const hasPendingProjects = projects.some(p =>
            (!p.updated && !p.patFailure) ||
            (p.deploymentConfig?.deploy === 'PENDING' || p.deploymentConfig?.deploy === 'MAY_FAIL_STAGE')
        );
        let intervalId;

        if (hasPendingProjects) {
            intervalId = setInterval(() => {
                // Fetch silently without setting global loading state
                Promise.all([
                    getAllProjects(),
                    getDeploymentStatuses().catch(() => [])
                ]).then(([projectsData, deploymentData]) => {
                    const mergedProjects = (projectsData || []).map(p => {
                        const deployStatus = (deploymentData || []).find(d => d.storedUrl === p.storedUrl);
                        return { ...p, deploymentConfig: deployStatus };
                    });
                    setProjects(mergedProjects);
                }).catch(console.error);
            }, 5000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [projects]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteProject(id);
            // Refresh the project list
            await fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleProjectAdded = () => {
        fetchProjects();
    };

    const handleStartBuild = async (id) => {
        try {
            setBuildingId(id);
            const message = await startBuild(id);
            alert(message || 'Build started successfully!');
        } catch (error) {
            console.error('Failed to start build:', error);
            alert('Failed to start build. Please try again.');
        } finally {
            setBuildingId(null);
        }
    };

    const handleStartDeploy = async (project) => {
        if (!project.storedUrl) {
            alert('Project path (storedUrl) is not available. Please wait for the initial pull.');
            return;
        }
        try {
            setDeployingId(project.id);
            const message = await startDeploy(project.storedUrl);
            alert(message || 'Deployment started successfully!');
        } catch (error) {
            console.error('Failed to start deployment:', error);
            alert('Failed to start deployment. Please try again.');
        } finally {
            setDeployingId(null);
        }
    };

    return (
        <>
            <div className="w-80 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/20 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FolderGit2 className="w-6 h-6 text-blue-400" />
                            Projects
                        </h2>
                        <button
                            onClick={fetchProjects}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="Refresh projects"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Add Project Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white hover:from-blue-600 hover:to-indigo-600 transition-all font-medium shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add Project
                    </button>
                </div>

                {/* Projects List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No projects yet</p>
                            <p className="text-xs mt-1">Click "Add Project" to get started</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedProject && setSelectedProject(project)}
                                className={`group cursor-pointer rounded-lg p-4 transition-all ${selectedProject?.id === project.id
                                    ? 'bg-white/10 border border-blue-500/50 ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium truncate mb-1">
                                            {project.fileName}
                                        </h3>
                                        <p className="text-xs text-gray-400 truncate mb-2">
                                            {project.gitUrl}
                                        </p>
                                        <div className="flex items-center flex-wrap gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                                                {project.branch}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Show processing status if project isn't ready and hasn't failed */}
                                        {!project.updated && !project.patFailure && (
                                            <div className="flex items-center gap-2 text-blue-400 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span className="text-sm font-medium">Syncing repo...</span>
                                            </div>
                                        )}
                                        {project.patFailure && (
                                            <div className="flex items-center gap-2 text-red-400 px-3 py-1.5 bg-red-500/10 rounded-lg" title="Authentication failed. Please check your PAT.">
                                                <span className="text-sm font-medium">Auth Failed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Project Modal */}
            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectAdded}
            />

            {/* Cloud Credentials Modal */}
            <CloudCredentialsModal
                isOpen={cloudModalOpen}
                onClose={() => setCloudModalOpen(false)}
                storedUrl={selectedStoredUrl}
            />
        </>
    );
};

export default ProjectSidebar;
