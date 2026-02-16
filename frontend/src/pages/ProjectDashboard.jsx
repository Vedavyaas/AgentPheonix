import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, X } from 'lucide-react';
import CredentialsPage from './CredentialsPage';
import ProjectSidebar from './ProjectSidebar';

const ProjectDashboard = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activePanel, setActivePanel] = useState(null);

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
                <ProjectSidebar />

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
                        <div className="max-w-7xl mx-auto">
                            {/* Dashboard content will go here */}
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
        </div>
    );
};

export default ProjectDashboard;
