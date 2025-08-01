'use client'
import LoginButton from '@/components/common/LoginButton';
import { Bot, Search, ArrowRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const PublicAgent = ({ agents, searchTerm, setSearchTerm}) => {
    const router = useRouter();
    const handleSelect = (agentId) => {
        router.push(`/publicAgent/${agentId}`);
    };


    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className='flex items-center justify-between'>
                <div className="flex items-center  justify-between gap-4 mb-4">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 ml-2">Public Agents</h2>
                </div>
                <div className="flex items-center justify-between mb-8">
                {typeof window !== 'undefined' && !localStorage.getItem('publicAgentProxyToken') && (
                    <LoginButton className="btn btn-primary btn-sm">
                        Sign In
                    </LoginButton>
                )}
            </div>
                </div>
                {/* Grid Layout */}
                {agents?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                        {agents.map((agent) => (
                            <div
                                key={agent._id}
                                className="group bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                                onClick={() => handleSelect(agent.page_config.url_slugname)}
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
                                
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
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                                                <Users className="w-3 h-3 text-white" />
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
                                        {agent.page_config?.description || 'Public AI assistant available for everyone'}
                                    </p>

                                    <div className="flex justify-end">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-800 group-hover:to-slate-900 flex items-center justify-center transition-all duration-300 shadow-md">
                                            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Bot className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {searchTerm ? 'No assistants found' : 'No assistants available'}
                        </h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                            {searchTerm 
                                ? `No assistants match "${searchTerm}". Try a different search term.`
                                : 'Check back later for available AI assistants.'
                            }
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-sm text-slate-900 hover:text-slate-700 font-medium"
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

export default PublicAgent;
