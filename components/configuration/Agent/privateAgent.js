'use client'
import { Bot, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const PrivateAgent = ({ agents, searchTerm, setSearchTerm }) => {
    const router = useRouter()
    const handleSelect = (agentId) => {
        router.push(`/publicAgent/${agentId}`);
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg">
                            <Lock className="w-4 h-4 text-yellow-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Private Agents
                        </h2>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem('publicAgentProxyToken');
                            localStorage.removeItem('privateAgentUserId');
                            window.location.reload();
                        }}
                        className="btn text-red-500 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
                {/* Grid Layout */}
                {agents?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                        {agents.map((agent) => (
                            <div
                                key={agent._id}
                                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                                onClick={() => handleSelect(agent.page_config.url_slugname)}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
                                
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center mb-4">
                                        <div className="relative mr-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-slate-800 group-hover:to-slate-900 transition-all duration-300 shadow-md">
                                                {agent.avatar ? (
                                                    <img src={agent.avatar} alt={`${agent.name} avatar`} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <Bot className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors duration-300" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                                                <Lock className="w-3 h-3 text-yellow-400" />
                                            </div>
                                        </div>
                                        <div className="tooltip" data-tip={agent.page_config.url_slugname.split('-').map(word => 
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}>
                                            <h3 
                                                className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 truncate"
                                            >
                                                {agent.page_config.url_slugname.split('-').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ').length > 20 
                                                    ? `${agent.page_config.url_slugname.split('-').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ').substring(0, 20)}...` 
                                                    : agent.page_config.url_slugname.split('-').map(word => 
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')
                                                }
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-grow">
                                        {agent?.page_config?.description || 'No description available'}
                                    </p>

                                    <div className="flex justify-end">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-800 group-hover:to-slate-900 flex items-center justify-center transition-all duration-300 shadow-md">
                                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                            <Lock className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {searchTerm ? 'No private assistants found' : 'No private assistants available'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {searchTerm 
                                ? `No private assistants match "${searchTerm}". Try a different search term.`
                                : 'Private assistants will appear here when available.'
                            }
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-slate-900 hover:text-slate-700 font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PrivateAgent;