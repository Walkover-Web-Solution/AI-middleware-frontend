
'use client'
import { Bot, Lock } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

const PrivateAgent = ({ agents }) => {
    const router = useRouter();
    
    const handleSelect = (agentId) => {
        router.push(`/publicAgent/${agentId}`);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Simple Header */}
            <div className="flex items-center gap-3 mb-8">
                <Lock className="w-6 h-6 text-slate-600" />
                <h1 className="text-2xl font-semibold text-base-content">Private Agents</h1>
                <div className="badge badge-outline border-slate-300 text-slate-600 badge-sm">Premium</div>
            </div>

            {/* Clean Agent Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents
                    ?.filter(agent => agent.page_config)
                    ?.map((agent) => (
                        <div
                            key={agent._id}
                            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-slate-200 hover:border-slate-300"
                        >
                            <div className="card-body p-5">
                                {/* Premium Badge */}
                                <div className="badge badge-outline border-slate-300 text-slate-600 badge-xs absolute top-3 right-3">
                                    Premium
                                </div>

                                {/* Simple Avatar with Lock */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full relative">
                                            {agent.avatar ? (
                                                <img
                                                    src={agent.avatar}
                                                    alt={`${agent.name} avatar`}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                                    <Bot className="w-6 h-6 text-slate-600" />
                                                </div>
                                            )}
                                            
                                            {/* Small lock indicator */}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                                                <Lock className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h2 className="font-medium text-base-content">
                                            {agent.page_config.url_slugname}
                                        </h2>
                                        <p className="text-sm text-base-content/60 line-clamp-2">
                                            {agent.description || agent.configuration?.prompt || 'Premium agent with advanced features'}
                                        </p>
                                    </div>
                                </div>

                                {/* Simple Button */}
                                <button
                                    className="btn bg-slate-600 hover:bg-slate-700 text-white border-none btn-sm w-full"
                                    onClick={() => handleSelect(agent.page_config.url_slugname)}
                                >
                                    Access
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Simple Empty State */}
            {(!agents || agents.filter(agent => agent.page_config).length === 0) && (
                <div className="text-center py-12">
                    <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-base-content/60">No private agents available</p>
                </div>
            )}
        </div>
    );
};

export default PrivateAgent;