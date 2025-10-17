'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import { Plus, Bot, Play, Settings, Trash2, Copy, Search, Filter, Activity, Zap, GitBranch, Clock, Calendar, Users } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createNewOrchestralFlowAction, deleteOrchetralFlowAction } from '@/store/action/orchestralFlowAction';
import { useRouter } from 'next/navigation';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import DeleteModal from '@/components/UI/DeleteModal';
import MainLayout from '@/components/layoutComponents/MainLayout';
import PageHeader from '@/components/Pageheader';
import CreateNewOrchestralFlowModal from '@/components/modals/CreateNewOrchestralFlowModal';
import SearchItems from '@/components/UI/SearchItems';

export const runtime = 'edge';

export default function FlowsPage({ params, isEmbedUser }) {
  const resolvedParams = use(params);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDataToDelete, setSelectedDataToDelete] = useState(null);
  const [saveData, setSaveData] = useState({
    name: '',
    description: '',
    status: 'draft',
  })
  const dispatch = useDispatch();
  const router = useRouter();

  // Get orchestral flow data from reducer
  const orchestralFlowData = useCustomSelector((state) =>
    state.orchestralFlowReducer.orchetralFlowData[resolvedParams.org_id] || []
  );
  const [filterFlows, setFilterFlows] = useState(orchestralFlowData)

  useEffect(()=>{
    setFilterFlows(orchestralFlowData)
  },[orchestralFlowData])

  // Helper function to count agents in a flow
  const countAgents = (agents) => {
    return Object.keys(agents || {}).length;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };



  // Helper function to get bridge type display
  const getBridgeTypeDisplay = (bridgeType) => {
    switch (bridgeType) {
      case 'api': return { name: 'API Bridge', color: 'text-blue-600 bg-blue-100' };
      case 'chatbot': return { name: 'Chatbot', color: 'text-green-600 bg-green-100' };
      case 'trigger': return { name: 'Trigger', color: 'text-purple-600 bg-purple-100' };
      default: return { name: bridgeType?.toUpperCase() || 'Unknown', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const handleCreateFlow = () => {
    openModal(MODAL_TYPE.CREATE_ORCHESTRAL_FLOW_MODAL);
  };

  const handleCreateNewFlow = () => {
    dispatch(createNewOrchestralFlowAction({
      org_id: resolvedParams.org_id,
      flow_name: saveData.name,
      agents: {},
      master_agent: "",
      bridge_type: "api",
      flow_description: saveData.description,
      status: saveData.status
    }, resolvedParams.org_id)).then((data) => {
      closeModal(MODAL_TYPE.CREATE_ORCHESTRAL_FLOW_MODAL);
      setSaveData({ name: '', description: '', status: 'draft' });
      router.push(`/org/${resolvedParams.org_id}/orchestratal_model/${data.data.id}`);
    });
  }
  const handleOpenFlow = (flowId) => {
    router.push(`/org/${resolvedParams.org_id}/orchestratal_model/${flowId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'publish': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'publish': return <Play className="w-3 h-3" />;
      case 'draft': return <Settings className="w-3 h-3" />;
      default: return <Settings className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'publish': return 'Published';
      case 'draft': return 'Draft';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const handleDeleteFlow = () => {
    closeModal(MODAL_TYPE.DELETE_MODAL);
    dispatch(deleteOrchetralFlowAction({ data: { orgId: resolvedParams.org_id, _id: selectedDataToDelete._id } }));
  };

  useEffect(() => {
    statusFilter !== 'all' ? setFilterFlows(orchestralFlowData.filter((flow) => flow.status === statusFilter)) : setFilterFlows(orchestralFlowData)
  }, [statusFilter]);

 
  return (
    <div className="px-2 pt-4">
      <MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-2">
          <PageHeader
            title="Orchestral Model"
            description="Create and manage your AI Orchestral Model workflows. Build complex agent interactions with our intuitive flow builder."
            docLink="https://gtwy.ai/blogs/features/orchestral-model"
            isEmbedUser={isEmbedUser}
          />
          <div className="mb-4">
            <div className="flex gap-4">
              <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-content/30">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-base-primary" />
                  <div>
                    <div className="text-2xl font-bold text-base-content">{orchestralFlowData.length}</div>
                    <div className="text-xs text-base-content">Total Flows</div>
                  </div>
                </div>
              </div>
              <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-content/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-success" />
                  <div>
                    <div className="text-2xl font-bold text-base-content">
                      {orchestralFlowData.filter(f => f.status === 'publish').length}
                    </div>
                    <div className="text-xs text-base-content">Published</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mx-auto">
          {/* Quick Stats */}

          {/* Search and Filter Bar */}
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1 relative">
              {orchestralFlowData?.length>5 && ( 
                <SearchItems
                  data={orchestralFlowData}
                  setFilterItems={setFilterFlows}
                  item='Flows'
                />
              )}
           
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-base-content/30 rounded-lg focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {orchestralFlowData.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* Create New Flow Card */}
            <div
              onClick={handleCreateFlow}
              className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl 
                     p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl
                     border-2 border-transparent hover:border-white/20 min-h-[320px]
                     flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 
                          rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 text-center">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-16 h-16 bg-base-content/20 rounded-full flex items-center justify-center 
                              backdrop-blur-sm border border-base-content/30/30 mx-auto">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  Create New Flow
                </h3>
                <p className="text-white text-sm leading-relaxed">
                  Start building your AI agent workflow with our intuitive flow builder
                </p>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-xs text-white font-medium">
                    Click to get started →
                  </div>
                </div>
              </div>

              {/* Animated Background Elements */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-base-content/30 rounded-full 
                          animate-pulse group-hover:animate-bounce" />
              <div className="absolute bottom-6 left-4 w-1 h-1 bg-base-content/40 rounded-full 
                          animate-pulse delay-1000" />
            </div>

            {/* Flow Cards */}
            {filterFlows.map((flow) => {
              const agentCount = countAgents(flow.agents);
              const bridgeInfo = getBridgeTypeDisplay(flow.bridge_type);
              const masterAgent = flow.agents[flow.master_agent];

              return (
                <div
                  key={flow._id}
                  onClick={() => handleOpenFlow(flow._id)}
                  className="group relative bg-base-100 rounded-2xl p-6 cursor-pointer 
                         transition-all duration-300 hover:scale-105 hover:shadow-xl
                         border border-base-content/30 hover:border-blue-300 min-h-[320px]
                         flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-4 h-4 text-base-content" />
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                          {getStatusIcon(flow.status)}
                          {getStatusLabel(flow.status)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-base-content group-hover:text-blue-600 
                                 transition-colors duration-200 line-clamp-2 mb-1">
                        {flow.flow_name}
                      </h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bridgeInfo.color}`}>
                        {bridgeInfo.name}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-base-content text-sm mb-4 line-clamp-2 flex-1">
                    {flow.flow_description}
                  </p>

                  {/* Master Agent Info */}
                  {masterAgent && (
                    <div className="mb-4 p-3 bg-base-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-medium text-base-content">Master Agent</span>
                      </div>
                      <div className="text-sm font-medium text-base-content">{masterAgent.name}</div>
                      <div className="text-xs text-base-content line-clamp-1">{masterAgent.description}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-base-content">{agentCount} agents</span>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-x-4 top-4 opacity-0 group-hover:opacity-100 
                              transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDataToDelete(flow);
                          openModal(MODAL_TYPE.DELETE_MODAL);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}

          {/* Empty State */}
          {(filterFlows.length === 0 && !orchestralFlowData.length === 0) && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-base-content" />
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">No flows found</h3>
              <p className="text-base-content mb-4">Try adjusting your search or filters</p>
            </div>
          )}

          {/* No Data State */}
          {orchestralFlowData.length === 0 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GitBranch className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No flows yet</h3>
              <p className="text-white mb-8 max-w-md mx-auto">
                Start creating your first AI agent workflow to automate complex tasks and processes.
              </p>
              <button
                onClick={handleCreateFlow}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Create Your First Flow
              </button>
            </div>
          )}
        </div>
        <DeleteModal onConfirm={handleDeleteFlow} item={selectedDataToDelete} title="Delete Flow" description={`Are you sure you want to delete the flow "${selectedDataToDelete?.flow_name}"? This action cannot be undone.`}
        />
        <CreateNewOrchestralFlowModal handleCreateNewFlow={handleCreateNewFlow} createdFlow={false} saveData={saveData} setSaveData={setSaveData} />
      </MainLayout>
    </div>
  );
}