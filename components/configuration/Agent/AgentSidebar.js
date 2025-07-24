'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

const AgentSidebar = ({
  publicAgents = [],
  privateAgents = [],
  selectedAgentId,
  onSelectAgent
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderAgentList = (agents, type) => {
    if (!agents?.length) return null;
    
    return (
      <div className="mb-6">
        {!sidebarCollapsed && (
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 px-3">
            {type} Agents
          </h3>
        )}
        <div className="space-y-1">
          {agents.map((agent) => (
            <div
              key={`${type}-${agent?.page_config?.url_slugname}`}
              onClick={() => onSelectAgent(agent?.page_config?.url_slugname)}
              className={`flex items-center w-full p-3 rounded-md cursor-pointer transition-colors
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
                  {type === 'Public' ? '🌐' : '🔒'}
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="truncate">
                  <div className="font-medium text-gray-800">{agent.page_config?.url_slugname}</div>
                  <div className="text-xs text-gray-500 truncate">{agent.description || 'No description'}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white border-r border-gray-200 p-4 transition-all duration-300 relative h-full`}>
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-white rounded-full p-1 border border-gray-200 shadow-sm hover:bg-gray-50 z-10"
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      <div className="flex flex-col h-full overflow-hidden">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200">
            Available Agents
          </h1>
        )}
        <div className="flex-grow overflow-y-auto pr-1">

          {localStorage.getItem('publicAgentProxyToken') && (
            <>
              {renderAgentList(privateAgents, 'Private')}
              {privateAgents?.length > 0 && publicAgents?.length && !sidebarCollapsed && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                </div>
              )}
            </>
          )}
          {renderAgentList(publicAgents, 'Public')}
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;
