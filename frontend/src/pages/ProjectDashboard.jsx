import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, X, Cloud, Play, Trash2, Cloud as CloudIcon, ExternalLink, FolderGit2 } from 'lucide-react';
import { deleteProject, startBuild, startDeploy } from '../api';
import CredentialsPage from './CredentialsPage';
import ProjectSidebar from './ProjectSidebar';
import CloudCredentialsModal from './CloudCredentialsModal';

const ProjectDashboard = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activePanel, setActivePanel] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [buildingId, setBuildingId] = useState(null);
    const [deployingId, setDeployingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [cloudModalOpen, setCloudModalOpen] = useState(false);
    const [selectedStoredUrl, setSelectedStoredUrl] = useState(null);

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
            alert('Project path is not available yet. Please wait for initial sync.');
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }
        try {
            setDeletingId(id);
            await deleteProject(id);
            setSelectedProject(null);
            // Re-fetch handled automatically by Sidebar polling or explicit refresh
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        // Clear token
        localStorage.removeItem('token');
        // Force full page reload to re-evaluate auth state in App.jsx
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>

            <div className="relative z-10 min-h-screen flex">
                {/* Left Sidebar - Projects */}
                <ProjectSidebar
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Top Navigation Bar */}
                    <nav className="flex items-center justify-between p-6">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                            Project Portal
                        </h1>

                        {/* User Menu Button */}
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg hover:bg-white/20 transition-all shadow-lg"
                        >
                            <User className="w-5 h-5 text-blue-400" />
                            <span className="text-white font-medium">Account</span>
                        </button>
                    </nav>

                    {/* Main Dashboard Content */}
                    <main className="flex-1 p-8">
                        <div className="max-w-7xl mx-auto h-full flex flex-col">
                            {!selectedProject ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                                        <Cloud className="w-12 h-12 text-blue-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-4">Welcome to Project Portal</h2>
                                    <p className="text-gray-400 max-w-md text-lg">
                                        Select a project from the sidebar to view its details, monitor deployment status, and access live previews.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Project Header Banner */}
                                    <div className="bg-gradient-to-br from-[#1e2536] to-[#121622] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                                <div>
                                                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 tracking-tight">
                                                        {selectedProject.fileName}
                                                    </h2>
                                                    <div className="flex items-center flex-wrap gap-3">
                                                        <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 font-medium tracking-wide">
                                                            {selectedProject.branch}
                                                        </span>
                                                        {selectedProject.deploymentConfig?.built && (
                                                            <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400 flex items-center gap-2 font-medium tracking-wide">
                                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                                Build Ready
                                                            </span>
                                                        )}
                                                        {selectedProject.deploymentConfig?.deploy === 'DEPLOYED' && (
                                                            <span className="px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400 flex items-center gap-2 font-medium tracking-wide">
                                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                                Live on Vercel
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-black/30 rounded-xl p-4 border border-white/5 inline-flex items-center gap-4 max-w-full overflow-hidden shadow-inner">
                                                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                                                    <FolderGit2 className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <span className="text-gray-300 font-mono text-sm truncate">{selectedProject.gitUrl}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Center */}
                                    <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col p-8 relative overflow-hidden">

                                        <div className="relative z-10">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-500/20 rounded-md">
                                                    <Play className="w-4 h-4 text-blue-400" />
                                                </div>
                                                Pipeline Actions
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Build Action */}
                                                <button
                                                    onClick={() => handleStartBuild(selectedProject.id)}
                                                    disabled={buildingId === selectedProject.id || deployingId === selectedProject.id}
                                                    className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:border-blue-500/30 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:border-white/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                                            <Settings className="w-6 h-6 text-blue-400" />
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="text-lg text-white font-semibold">Build Project</h4>
                                                            <p className="text-sm text-gray-400 mt-1">Compile and prepare</p>
                                                        </div>
                                                    </div>
                                                    {buildingId === selectedProject.id ? (
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                            <Play className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                        </div>
                                                    )}
                                                </button>

                                                {/* Deploy Action */}
                                                <button
                                                    onClick={() => handleStartDeploy(selectedProject)}
                                                    disabled={buildingId === selectedProject.id || deployingId === selectedProject.id || !selectedProject.deploymentConfig?.built}
                                                    className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:border-green-500/30 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:border-white/10"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl transition-transform ${!selectedProject.deploymentConfig?.built ? 'bg-gray-500/20' : 'bg-green-500/20 group-hover:scale-110'}`}>
                                                            <CloudIcon className={`w-6 h-6 ${!selectedProject.deploymentConfig?.built ? 'text-gray-400' : 'text-green-400'}`} />
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="text-lg text-white font-semibold flex items-center gap-2">
                                                                Deploy
                                                                {selectedProject.deploymentConfig?.deploy === 'MAY_FAIL_STAGE' && (
                                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500">Processing</span>
                                                                )}
                                                            </h4>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                {!selectedProject.deploymentConfig?.built ? 'Requires Build' : 'Push to live'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {deployingId === selectedProject.id ? (
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors ${!selectedProject.deploymentConfig?.built ? '' : 'group-hover:bg-green-500/20'}`}>
                                                            <Play className={`w-4 h-4 transition-colors ${!selectedProject.deploymentConfig?.built ? 'text-gray-400' : 'text-gray-400 group-hover:text-green-400'}`} />
                                                        </div>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="mt-10 pt-6 border-t border-white/10 relative">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <button
                                                        onClick={() => {
                                                            if (!selectedProject.storedUrl) {
                                                                alert('Project path is not available yet. Please wait for initial sync.');
                                                                return;
                                                            }
                                                            setSelectedStoredUrl(selectedProject.storedUrl);
                                                            setCloudModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-xl transition-all font-medium"
                                                    >
                                                        <CloudIcon className="w-4 h-4" />
                                                        Cloud Credentials
                                                    </button>

                                                    {selectedProject.deploymentConfig?.url && (
                                                        <a
                                                            href={selectedProject.deploymentConfig.url.startsWith('http') ? selectedProject.deploymentConfig.url : `https://${selectedProject.deploymentConfig.url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                            Open Live Site
                                                        </a>
                                                    )}

                                                    <div className="flex-1"></div>

                                                    <button
                                                        onClick={() => handleDelete(selectedProject.id)}
                                                        disabled={deletingId === selectedProject.id}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all disabled:opacity-50 font-medium hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-red-500/40"
                                                    >
                                                        {deletingId === selectedProject.id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete Project
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* User Menu Slide-out Panel */}
            <AnimatePresence>
                {userMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Slide-out Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 flex flex-col"
                        >
                            {/* Panel Header */}
                            <div className="p-6 border-b border-white/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-white">Menu</h2>
                                    <button
                                        onClick={() => setUserMenuOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 p-6 space-y-2">
                                <button
                                    onClick={() => {
                                        setActivePanel('credentials');
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                                >
                                    <Settings className="w-5 h-5 text-blue-400" />
                                    <span className="font-medium">Credentials</span>
                                </button>
                            </div>

                            {/* Logout Button at Bottom */}
                            <div className="p-6 border-t border-white/20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Credentials Panel */}
            <AnimatePresence>
                {activePanel === 'credentials' && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActivePanel(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Credentials Slide-out Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-slate-900/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setActivePanel(null)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all z-10"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            {/* Credentials Content */}
                            <div className="p-8 pt-20">
                                <CredentialsPage />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Cloud Credentials Modal */}
            <CloudCredentialsModal
                isOpen={cloudModalOpen}
                onClose={() => setCloudModalOpen(false)}
                storedUrl={selectedStoredUrl}
            />
        </div>
    );
};

export default ProjectDashboard;
