'use client';
import { Bot, ChevronLeft, ChevronRight, Globe, User, Lock } from 'lucide-react';
import React, { useState } from 'react';

const AgentSidebar = ({
  publicAgents = [],
  privateAgents = [],
  selectedAgentId,
  onSelectAgent = () => {}
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
          <div className="flex items-center gap-2 px-3 mb-4">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
              type === 'Private' 
                ? 'bg-gray-100 text-gray-800 border-gray-300' 
                : 'bg-white text-gray-600 border-gray-300'
            }`}>
              {type === 'Private' ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Globe className="w-3 h-3" />
              )}
              {type}
            </div>
          </div>
        )}
        
        <div className="space-y-1.5">
          {agents.map((agent) => (
            <div
              key={`${type}-${agent?.page_config?.url_slugname || agent?.id || Math.random()}`}
              onClick={() => onSelectAgent(agent?.page_config?.url_slugname)}
              className={`
                ${sidebarCollapsed 
                  ? 'flex flex-col items-center gap-1 p-2 mx-2' 
                  : 'flex items-center gap-3 p-3 mx-2'
                } 
                rounded-lg cursor-pointer transition-all duration-200 group
                ${selectedAgentId === agent?.page_config?.url_slugname
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
              title={sidebarCollapsed ? agent.page_config?.url_slugname || agent.name || 'Unnamed Agent' : ''}
            >
              <div className={`avatar placeholder ${sidebarCollapsed ? '' : 'flex-shrink-0'}`}>
                <div className={`
                  ${selectedAgentId === agent?.page_config?.url_slugname
                    ? 'bg-white text-black'
                    : 'bg-gray-200 text-gray-600'
                  }
                  rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200
                `}>
                  {agent.avatar ? (
                    <img
                      src={agent.avatar}
                      alt={`${agent.name || 'Agent'} avatar`}
                      className="rounded-full w-8 h-8 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      {type === 'Private' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {sidebarCollapsed ? (
                <div className="text-xs font-medium text-center leading-tight max-w-full px-1">
                  <div className="truncate">
                    {agent.page_config?.url_slugname || agent.name || 'Unnamed'}
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-semibold truncate text-sm">
                    {agent.page_config?.url_slugname || agent.name || 'Unnamed Agent'}
                  </div>
                  <div className="text-xs opacity-75 truncate mt-0.5 leading-relaxed">
                    {agent.page_config?.description || 'No description available'}
                  </div>
                </div>
              )}
              
              {!sidebarCollapsed && selectedAgentId === agent?.page_config?.url_slugname && (
                <ChevronRight className="w-4 h-4 opacity-80 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white border-r border-gray-300 transition-all duration-300 relative h-full flex flex-col`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all duration-200 flex items-center justify-center z-10"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
        )}
      </button>
      
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">
                GTWY Agents
              </h1>
              <p className="text-xs text-gray-500">
                Available Agents
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto py-4">
          {/* Private Agents */}
          {privateAgents.length > 0 && localStorage.getItem('publicAgentProxyToken') && (
            <>
              {renderAgentList(privateAgents, 'Private')}
              {publicAgents.length > 0 && !sidebarCollapsed && (
                <div className="mx-4 border-t border-gray-200 my-6"></div>
              )}
            </>
          )}
          {/* Public Agents */}
          {renderAgentList(publicAgents, 'Public')}
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;