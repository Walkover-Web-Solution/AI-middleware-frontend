'use client'
import { Bot, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import LoginButton from '@/components/common/LoginButton';
import Image from 'next/image';

const PublicAgent = ({ token, agents }) => {
    const router = useRouter();

    const handleSelect = (agentId) => {
        router.push(`/publicAgent/${agentId}`);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Simple Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-semibold text-base-content">Public Agents</h1>
                </div>
                
                {typeof window !== 'undefined' && !localStorage.getItem('publicAgentProxyToken') && (
                    <LoginButton className="btn btn-primary btn-sm">
                        Sign In
                    </LoginButton>
                )}
            </div>

            {/* Clean Agent Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {agents
                    ?.filter(agent => agent.page_config)
                    ?.map((agent) => (
                        <div
                            key={agent._id}
                            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
                        >
                            <div className="card-body p-5">
                                {/* Simple Avatar */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            {agent.avatar ? (
                                                <Image
                                                    src={agent.avatar}
                                                    alt={`${agent.name} avatar`}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-base-300">
                                                    <Bot className="w-6 h-6 text-base-content/60" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 break-words break-all">
                                        <h2 className="font-medium text-base-content">
                                            {agent.page_config.url_slugname}
                                        </h2>
                                        <p className="text-sm text-base-content/60 line-clamp-2 break-words break-all">
                                            {agent.page_config.description || 'No description available'}
                                        </p>
                                    </div>
                                </div>

                                {/* Simple Button */}
                                <button
                                    className="btn btn-primary btn-sm "
                                    onClick={() => handleSelect(agent.page_config.url_slugname)}
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Simple Empty State */}
            {(!agents || agents.filter(agent => agent.page_config).length === 0) && (
                <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-base-content/40 mx-auto mb-4" />
                    <p className="text-base-content/60">No public agents available</p>
                </div>
            )}
        </div>
    );
};

export default PublicAgent;