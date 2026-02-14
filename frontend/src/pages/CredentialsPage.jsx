import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, User, Save, RefreshCw } from 'lucide-react';
import { setGitCredentials, updateGitUsername, updateGitPAT } from '../api';

const CredentialsPage = () => {
    const [credentials, setCredentials] = useState({
        gitUsername: '',
        pat: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSetCredentials = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await setGitCredentials(credentials);
            setMessage({ text: response || 'Credentials set successfully!', type: 'success' });
        } catch (error) {
            setMessage({
                text: error.response?.data || 'Failed to set credentials',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!credentials.gitUsername) {
            setMessage({ text: 'Please enter a Git username', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await updateGitUsername(credentials.gitUsername);
            setMessage({ text: response || 'Username updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({
                text: error.response?.data || 'Failed to update username',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePAT = async () => {
        if (!credentials.pat) {
            setMessage({ text: 'Please enter a Personal Access Token', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await updateGitPAT(credentials.pat);
            setMessage({ text: response || 'PAT updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({
                text: error.response?.data || 'Failed to update PAT',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
                    Git Credentials
                </h1>
                <p className="text-gray-400">
                    Manage your Git credentials for project access
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

            {/* Set Credentials Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6"
            >
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Key className="w-6 h-6 text-blue-400" />
                    Set Git Credentials
                </h2>

                <form onSubmit={handleSetCredentials} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Git Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={credentials.gitUsername}
                                onChange={(e) => setCredentials({ ...credentials, gitUsername: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder="Enter your Git username"
                                required
                            />
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
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder="Enter your Personal Access Token"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Setting Credentials...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Set Credentials
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Update Individual Fields */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Update Username */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Update Username
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={credentials.gitUsername}
                            onChange={(e) => setCredentials({ ...credentials, gitUsername: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            placeholder="New Git username"
                        />
                        <button
                            onClick={handleUpdateUsername}
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update Username
                        </button>
                    </div>
                </motion.div>

                {/* Update PAT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-400" />
                        Update PAT
                    </h3>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={credentials.pat}
                            onChange={(e) => setCredentials({ ...credentials, pat: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                            placeholder="New Personal Access Token"
                        />
                        <button
                            onClick={handleUpdatePAT}
                            disabled={loading}
                            className="w-full py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update PAT
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CredentialsPage;
