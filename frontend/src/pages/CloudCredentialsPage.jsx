import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Key, MapPin, Save, RefreshCw, Server } from 'lucide-react';
import {
    createCloudCredentials,
    updateCloudPAT,
    updateCloudRegion,
    updateCloudInfra,
} from '../api';

const CLOUD_OPTIONS = ['AWS', 'VERCEL'];

const CloudCredentialsPage = () => {
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
        await withLoading(async () => {
            try {
                const res = await createCloudCredentials(credentials);
                showMessage(res || 'Cloud credentials stored!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to store credentials', 'error');
            }
        });
    };

    const handleUpdatePAT = async () => {
        if (!credentials.pat) return showMessage('Please enter a PAT', 'error');
        await withLoading(async () => {
            try {
                const res = await updateCloudPAT(credentials.pat);
                showMessage(res || 'PAT updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update PAT', 'error');
            }
        });
    };

    const handleUpdateRegion = async () => {
        if (!credentials.region) return showMessage('Please enter a region', 'error');
        await withLoading(async () => {
            try {
                const res = await updateCloudRegion(credentials.region);
                showMessage(res || 'Region updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update region', 'error');
            }
        });
    };

    const handleUpdateInfra = async () => {
        await withLoading(async () => {
            try {
                const res = await updateCloudInfra(credentials.cloudInfrastructure);
                showMessage(res || 'Cloud infrastructure updated!', 'success');
            } catch (err) {
                showMessage(err.response?.data || 'Failed to update infrastructure', 'error');
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 mb-2">
                    Cloud Credentials
                </h1>
                <p className="text-gray-400">
                    Manage your cloud deployment credentials
                </p>
            </motion.div>

            {/* Message Display */}
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

            {/* Create Credentials Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Cloud className="w-6 h-6 text-violet-400" />
                    Set Cloud Credentials
                </h2>

                <form onSubmit={handleCreate} className="space-y-6">
                    {/* Cloud Infrastructure */}
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
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                                {CLOUD_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt} className="bg-slate-800 text-white">
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* PAT */}
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
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                placeholder="Enter your cloud PAT"
                                required
                            />
                        </div>
                    </div>

                    {/* Region */}
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
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                                placeholder="e.g. us-east-1"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Set Cloud Credentials
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Update Individual Fields */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Update PAT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-violet-400" />
                        Update PAT
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={credentials.pat}
                            onChange={(e) => setCredentials({ ...credentials, pat: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                            placeholder="New PAT"
                        />
                        <button
                            onClick={handleUpdatePAT}
                            disabled={loading}
                            className="w-full py-2.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update PAT
                        </button>
                    </div>
                </motion.div>

                {/* Update Region */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        Update Region
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={credentials.region}
                            onChange={(e) => setCredentials({ ...credentials, region: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
                            placeholder="e.g. us-east-1"
                        />
                        <button
                            onClick={handleUpdateRegion}
                            disabled={loading}
                            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update Region
                        </button>
                    </div>
                </motion.div>

                {/* Update Infrastructure */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-emerald-400" />
                        Update Infra
                    </h3>
                    <div className="space-y-4">
                        <select
                            value={credentials.cloudInfrastructure}
                            onChange={(e) =>
                                setCredentials({ ...credentials, cloudInfrastructure: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all appearance-none cursor-pointer"
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
                            className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update Infra
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CloudCredentialsPage;
