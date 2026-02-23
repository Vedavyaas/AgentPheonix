import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Key, MapPin, Save, RefreshCw, Server, X } from 'lucide-react';
import {
    createCloudCredentials,
    updateCloudPAT,
    updateCloudRegion,
    updateCloudInfra,
} from '../api';

const CLOUD_OPTIONS = ['AWS', 'VERCEL'];

const CloudCredentialsModal = ({ isOpen, onClose, storedUrl }) => {
    const [credentials, setCredentials] = useState({
        cloudInfrastructure: 'AWS',
        pat: '',
        region: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type) => setMessage({ text, type });

    const withLoading = async (fn) => {
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            await fn();
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!storedUrl) return showMessage('Project path (storedUrl) is missing. Cannot save credentials.', 'error');
        await withLoading(async () => {
            try {
                const res = await createCloudCredentials(storedUrl, credentials);
                showMessage(res || 'Cloud credentials stored!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to store credentials', 'error');
            }
        });
    };

    const handleUpdatePAT = async () => {
        if (!credentials.pat) return showMessage('Please enter a PAT', 'error');
        if (!storedUrl) return showMessage('Project path missing', 'error');
        await withLoading(async () => {
            try {
                const res = await updateCloudPAT(credentials.pat, storedUrl);
                showMessage(res || 'PAT updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update PAT', 'error');
            }
        });
    };

    const handleUpdateRegion = async () => {
        if (!credentials.region) return showMessage('Please enter a region', 'error');
        if (!storedUrl) return showMessage('Project path missing', 'error');
        await withLoading(async () => {
            try {
                const res = await updateCloudRegion(credentials.region, storedUrl);
                showMessage(res || 'Region updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update region', 'error');
            }
        });
    };

    const handleUpdateInfra = async () => {
        if (!storedUrl) return showMessage('Project path missing', 'error');
        await withLoading(async () => {
            try {
                const res = await updateCloudInfra(credentials.cloudInfrastructure, storedUrl);
                showMessage(res || 'Cloud infrastructure updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update infrastructure', 'error');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                                        Cloud Credentials
                                    </h2>
                                    <p className="text-gray-400 mt-1">
                                        Manage deployment credentials for this project
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
                            >
                                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Cloud className="w-5 h-5 text-violet-400" />
                                    Set New Credentials
                                </h3>

                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Cloud Infrastructure
                                            </label>
                                            <div className="relative">
                                                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                                <select
                                                    value={credentials.cloudInfrastructure}
                                                    onChange={(e) =>
                                                        setCredentials({ ...credentials, cloudInfrastructure: e.target.value })
                                                    }
                                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all appearance-none"
                                                >
                                                    {CLOUD_OPTIONS.map((opt) => (
                                                        <option key={opt} value={opt} className="bg-slate-800 text-white">
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Region
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={credentials.region}
                                                    onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                                    placeholder="e.g. us-east-1"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Personal Access Token (PAT)
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="password"
                                                value={credentials.pat}
                                                onChange={(e) => setCredentials({ ...credentials, pat: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                                placeholder="Enter your cloud PAT"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Credentials
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                                >
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                                        <Key className="w-4 h-4 text-violet-400" /> Update PAT
                                    </h4>
                                    <input
                                        type="password"
                                        value={credentials.pat}
                                        onChange={(e) => setCredentials({ ...credentials, pat: e.target.value })}
                                        className="w-full px-3 py-2 mb-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        placeholder="New PAT"
                                    />
                                    <button
                                        onClick={handleUpdatePAT}
                                        disabled={loading}
                                        className="w-full py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                                    >
                                        Update PAT
                                    </button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                                >
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-cyan-400" /> Update Region
                                    </h4>
                                    <input
                                        type="text"
                                        value={credentials.region}
                                        onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
                                        className="w-full px-3 py-2 mb-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        placeholder="e.g. us-east-1"
                                    />
                                    <button
                                        onClick={handleUpdateRegion}
                                        disabled={loading}
                                        className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                                    >
                                        Update Region
                                    </button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                                >
                                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                                        <Server className="w-4 h-4 text-emerald-400" /> Update Infra
                                    </h4>
                                    <select
                                        value={credentials.cloudInfrastructure}
                                        onChange={(e) =>
                                            setCredentials({ ...credentials, cloudInfrastructure: e.target.value })
                                        }
                                        className="w-full px-3 py-2 mb-3 bg-black/20 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                                    >
                                        {CLOUD_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt} className="bg-slate-800 text-white">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleUpdateInfra}
                                        disabled={loading}
                                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                                    >
                                        Update Infra
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CloudCredentialsModal;
