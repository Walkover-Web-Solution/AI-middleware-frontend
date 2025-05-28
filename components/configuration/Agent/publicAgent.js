'use client'
import { Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const ChatBot = ({ agent, onBack }) => {
    return (
        <div className="flex flex-col h-full p-6 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{agent.page_config.url_slugname}</h2>
                <button
                    onClick={onBack}
                    className="btn btn-sm btn-ghost"
                >
                    Back to Agents
                </button>
            </div>
            <div className="flex-1 border-t border-gray-200 pt-4">
                {/* Chat interface would go here */}
                <div className="text-center text-gray-500 py-8 min-h-[100%]" id='parentChabot'>
                    Chat interface coming soon
                </div>
            </div>
        </div>
    );
};

const PublicAgent = ({ token, agents }) => {
    const [showSidebar, setShowSidebar] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const scriptId = 'chatbot-main-script'
    const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

    useEffect(() => {
        if (token) {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
            if (token) {
                const script = document.createElement("script");
                script.setAttribute("embedToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiIxNTcyMCIsImNoYXRib3RfaWQiOiI2ODM1OTgzZGI2ZjMwMzUxMTE1Y2I5OTUiLCJ1c2VyX2lkIjoiMTU4NzIiLCJpYXQiOjE3NDg0MDgwMzd9.dxcDFYhaJ7YqfteJ3np0oMEj3jrKuyTIm_FPlFAod5E");
                script.setAttribute("hideIcon", true);
                script.setAttribute('parentId','parentChabot')
                script.id = scriptId;
                script.src = scriptSrc;
                document.head.appendChild(script);
            }
        }
    }, [token]);

    const selectedAgent = agents.find((agent) => agent?.page_config.url_slugname === selectedAgentId);

    const handleSelect = (agentId) => {
        setSelectedAgentId(agentId);
        setShowSidebar(true);
    };

    const handleBack = () => {
        setShowSidebar(false);
        setSelectedAgentId(null);
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    if (!showSidebar) {
        return (
            <main className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold text-center mb-12 text-gray-800">Public Agents</h1>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {agents
                        ?.filter(agent => agent.page_config)
                        ?.map(agent => (
                            <div
                                key={agent._id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-5">
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 mr-4">
                                            {agent.avatar ? (
                                                <img
                                                    src={agent.avatar}
                                                    alt={`${agent.name} avatar`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-500">
                                                    <Bot className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-medium text-gray-900">
                                                {agent.page_config.url_slugname}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {agent.description || agent.configuration?.prompt || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                        onClick={() => handleSelect(agent.page_config.url_slugname)}
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </main>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white border-r border-gray-200 p-4 transition-all duration-300 relative`}>
                <button 
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-4 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:bg-gray-50"
                >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <div className="flex flex-col h-full">
                    {!sidebarCollapsed && (
                        <>
                            <h1 className="text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200">Available Agents</h1>
                            <nav className="flex-grow overflow-y-auto">
                                {agents.map((agent) => (
                                    <div
                                        key={agent?.page_config.url_slugname}
                                        onClick={() => setSelectedAgentId(agent?.page_config.url_slugname)}
                                        className={`flex items-center w-full p-3 mb-2 rounded-md cursor-pointer transition-colors
                                        ${selectedAgentId === agent?.page_config?.url_slugname
                                                ? 'bg-gray-100 border-l-4 border-gray-500'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {agent.avatar ? (
                                            <img
                                                src={agent.avatar}
                                                alt={`${agent.name} avatar`}
                                                className="w-8 h-8 rounded-full object-cover mr-3"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-3 text-sm">
                                                🤖
                                            </div>
                                        )}
                                        {!sidebarCollapsed && (
                                            <div className="truncate">
                                                <div className="font-medium text-gray-800">{agent.page_config.url_slugname}</div>
                                                <div className="text-xs text-gray-500 truncate">{agent.description}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </>
                    )}
                </div>
            </div>

            {/* Chatbot */}
            <div className="flex-1 p-6">
                {selectedAgent && (
                    <ChatBot agent={selectedAgent} onBack={handleBack} />
                )}
            </div>
        </div>
    );
};

export default PublicAgent;
