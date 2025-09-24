import React, { useCallback, useState, useMemo, useEffect } from "react";
import { X, AlertTriangle, Settings, CircleX, ArrowRightLeft, Check, Bot } from "lucide-react";
import {
  getAllBridgesAction,
  getBridgeVersionAction,
  publishBridgeVersionAction,
  publishBulkVersionAction,
  updateBridgeAction,
} from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, sendDataToParent } from "@/utils/utility";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import Modal from "../UI/Modal";
import { useCustomSelector } from '@/customHooks/customSelector';
import Protected from "../protected";
import PublishVersionDataComparisonView from "../comparison/PublishVersionDataComparisonView";
import { DIFFERNCE_DATA_DISPLAY_NAME, KEYS_TO_COMPARE } from "@/jsonFiles/bridgeParameter";

function PublishBridgeVersionModal({ params, searchParams, agent_name, agent_description, isEmbedUser }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublicAgent, setIsPublicAgent] = useState(false);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedAgentsToPublish, setSelectedAgentsToPublish] = useState(new Set());
  const [allConnectedAgents, setAllConnectedAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  const { bridge, versionData, bridgeData, agentList } = useCustomSelector((state) => ({
    bridge: state.bridgeReducer.allBridgesMap?.[params?.id]?.page_config,
    versionData: state.bridgeReducer.bridgeVersionMapping?.[params?.id]?.[searchParams?.version],
    bridgeData: state.bridgeReducer.allBridgesMap?.[params?.id],
    agentList: state.bridgeReducer.org[params.org_id]?.orgs || []
  }));

  // Memoized form data initialization
  const [formData, setFormData] = useState(() => ({
    url_slugname: '',
    availability: 'public',
    description: '',
    allowedUsers: [],
    newEmail: ''
  }));

  // Update form data when bridge data changes
  useEffect(() => {
    if (bridge) {
      setFormData(prev => ({
        ...prev,
        url_slugname: bridge.url_slugname || '',
        availability: bridge.availability || 'public',
        description: bridge.description || '',
        allowedUsers: bridge.allowedUsers || []
      }));
    }
  }, [bridge]);
  
  const getAllConnectedAgents = useCallback(async (agentId, versionData, agentList, useVersionData = false, visited = new Set()) => {
    if (!agentId || visited.has(agentId)) return [];  
    visited.add(agentId);
    let agent = useVersionData ? versionData : agentList?.find(a => a._id === agentId);
    if (!agent) return [];
    if (useVersionData) {
      agent = {
        ...agent,
        name: agentList?.find(a => a._id === agent?.parent_id)?.name || agent.name,
        haveToPublish: agent.is_drafted,
        isVersionData: true
      };
    }
    
    let result = [agent];
    const connectedAgents = agent?.connected_agents || {};
  
    const nestedPromises = Object.entries(connectedAgents).map(async ([agentName, agentInfo]) => {
      const connectedId = agentInfo.bridge_id;
      if (!connectedId) return [];
      
      const hasVersionId = agentInfo?.version_id !== undefined;
      let updatedVersionData;
      
      if (hasVersionId) {
        try {
          const fetchedData = await dispatch(getBridgeVersionAction({
            versionId: agentInfo.version_id
          }));
          
          updatedVersionData = fetchedData ? { ...fetchedData } : null;
        } catch (error) {
          console.error('Error fetching version data:', error);
          return [];
        }
      } else {
        updatedVersionData = versionData ? { ...versionData } : null;
      }
      
      return getAllConnectedAgents(
        connectedId,
        updatedVersionData,
        agentList,
        hasVersionId,
        new Set([...visited])
      );
    });
    
    const nestedResults = await Promise.all(nestedPromises);
    return result.concat(nestedResults.flat());
  }, [dispatch]);

  useEffect(() => {
    const fetchConnectedAgents = async () => {
      if (!params?.id || !versionData || !agentList.length) {
        setAllConnectedAgents([]);
        return;
      }

      setIsLoadingAgents(true);
      try {
        const agents = await getAllConnectedAgents(params.id, versionData, agentList, true);
        setAllConnectedAgents(Array.isArray(agents) ? agents : []);
      } catch (error) {
        console.error('Error fetching connected agents:', error);
        setAllConnectedAgents([]);
      } finally {
        setIsLoadingAgents(false);
      }
    };
    
    fetchConnectedAgents();
  }, [params?.id, versionData, agentList, getAllConnectedAgents]);

  const { filteredBridgeData, filteredVersionData } = useMemo(() => {
    const filterData = (data, keys) => {
      if (!data || !keys) return {};
      const filtered = {};
      keys.forEach(key => {
        if (key in data) {
          filtered[key] = data[key];
        }
      });
      return filtered;
    };

    return {
      filteredBridgeData: filterData(bridgeData, KEYS_TO_COMPARE),
      filteredVersionData: filterData(versionData, KEYS_TO_COMPARE)
    };
  }, [bridgeData, versionData]);

  const differences = useMemo(() => {
    if (!filteredBridgeData || !filteredVersionData) return {};

    const diff = {};
    const allKeys = [...new Set([...Object.keys(filteredBridgeData), ...Object.keys(filteredVersionData)])];

    allKeys.forEach(key => {
      const val1 = filteredBridgeData[key];
      const val2 = filteredVersionData[key];
      
      if (!val1 && !val2) return;

      if (key in filteredBridgeData && key in filteredVersionData) {
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          diff[key] = { oldValue: val1, newValue: val2, status: 'changed' };
        }
      } else if (key in filteredBridgeData) {
        diff[key] = { oldValue: val1, newValue: undefined, status: 'removed' };
      } else {
        diff[key] = { oldValue: undefined, newValue: val2, status: 'added' };
      }
    });

    return diff;
  }, [filteredBridgeData, filteredVersionData]);

  const extractedConfigChanges = useMemo(() => {
    const extracted = {};
    
    if (differences.configuration) {
      const oldConfig = filteredBridgeData.configuration || {};
      const newConfig = filteredVersionData.configuration || {};
      
      if (oldConfig.model !== newConfig.model) {
        extracted.model = {
          oldValue: oldConfig.model,
          newValue: newConfig.model,
          status: 'changed'
        };
      }

      if (oldConfig.prompt !== newConfig.prompt) {
        extracted.prompt = {
          oldValue: oldConfig.prompt,
          newValue: newConfig.prompt,
          status: 'changed'
        };
      }
    }

    if (differences.service) {
      extracted.service = differences.service;
    }

    return extracted;
  }, [differences, filteredBridgeData, filteredVersionData]);

  // Changes summary
  const changesSummary = useMemo(() => {
    return {
      ...Object.fromEntries(Object.entries(differences).map(([key, value]) => [key, value.status])),
      ...Object.fromEntries(Object.entries(extractedConfigChanges).map(([key, value]) => [key, value.status]))
    };
  }, [differences, extractedConfigChanges]);

  // Event handlers
  const handleCloseModal = useCallback((e) => {
    e?.preventDefault();
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const processedValue = name === 'url_slugname' ? value.replace(/\s+/g, '_') : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  }, []);

  const handleAddEmail = useCallback(() => {
    if (!formData.newEmail?.includes('@')) return;
    
    if (formData.allowedUsers.includes(formData.newEmail)) {
      toast.warn("This email has already been added.");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      allowedUsers: [...(prev.allowedUsers || []), prev.newEmail],
      newEmail: ''
    }));
  }, [formData.newEmail, formData.allowedUsers]);

  const handleRemoveUser = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter((_, i) => i !== indexToRemove)
    }));
  }, []);

  const toggleAgentSelection = useCallback((agentId) => {
    const agent = allConnectedAgents.find(a => a._id === agentId);
    if (!agent?.haveToPublish) return;
    
    setSelectedAgentsToPublish(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  }, [allConnectedAgents]);
  
  const toggleSelectAllAgents = useCallback(() => {
    const publishableAgents = allConnectedAgents
      .filter(agent => agent._id !== params?.id && agent?.haveToPublish)
      .map(agent => agent._id);
      
    if (publishableAgents.length === 0) return;
    
    const allSelected = publishableAgents.every(agentId => selectedAgentsToPublish.has(agentId));
    
    if (allSelected) {
      setSelectedAgentsToPublish(new Set());
    } else {
      setSelectedAgentsToPublish(new Set(publishableAgents));
    }
  }, [allConnectedAgents, params?.id, selectedAgentsToPublish]);

  const toggleComparison = useCallback(() => {
    setShowComparison(prev => !prev);
  }, []);

  const getVersionIndexToPublish = useCallback((agentId, isPublishedVersion = false) => {
    // For agents that need to be published (version data)
    if (!isPublishedVersion) {
      const versionIndex = agentList?.filter(oneAgent => oneAgent.versions.includes(agentId))[0]?.versions.findIndex(version => version === agentId);
      return versionIndex !== -1 ? versionIndex + 1 : 'N/A';
    } 
    // For getting published version index
    else {
      const agent = allConnectedAgents.find(a => a._id === agentId);
      if (agent?.haveToPublish) {
        // For agents that need publishing, find the published version from agentList
        const parentAgent = agentList?.filter(oneAgent => oneAgent.versions.includes(agentId))[0];
        const publishedVersionId = parentAgent?.published_version_id;
        const versionIndex = parentAgent?.versions?.findIndex(version => version === publishedVersionId);
        return versionIndex !== -1 ? versionIndex + 1 : 'None';
      } else {
        // For regular agents, use their own published_version_id
        const versionIndex = agent?.versions?.findIndex(version => version === agent.published_version_id);
        if (versionIndex !== -1 && versionIndex !== undefined) {
          return versionIndex + 1;
        }
        // Fallback to checking in agentList
        const parentAgent = agentList.find(oneAgent => oneAgent._id === agentId);
        const parentVersionIndex = parentAgent?.versions?.findIndex(version => version === parentAgent.published_version_id);
        return parentVersionIndex !== -1 && parentVersionIndex !== undefined ? parentVersionIndex + 1 : 'None';
      }
    }
  }, [agentList, allConnectedAgents]);

  const handlePublishBridge = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isPublicAgent) {
        if (!formData.url_slugname.trim()) {
          toast.error("Slug Name is required.");
          setIsLoading(false);
          return;
        }

        const payload = {
          page_config: {
            url_slugname: formData.url_slugname,
            availability: formData.availability,
            description: formData.description,
            allowedUsers: formData.availability === 'private' ? formData.allowedUsers : [],
          }
        };

        try {
          await dispatch(updateBridgeAction({
            bridgeId: params?.id,
            dataToSend: payload
          }));
          toast.success("Configuration saved successfully!");
        } catch (error) {
          if (error?.response?.data?.detail?.includes('DuplicateKey')) {
            setError({ error: 'This slug name already exists. Please choose a different one.' });
          }
          setIsLoading(false);
          return;
        }
      }

      await dispatch(
        publishBridgeVersionAction({
          bridgeId: params?.id,
          versionId: searchParams?.version,
          orgId: params?.org_id,
          isPublic: isPublicAgent,
        })
      );

      // Publish selected connected agents in bulk if available
      if (selectedAgentsToPublish.size > 0) {
        try {
          await dispatch(publishBulkVersionAction(Array.from(selectedAgentsToPublish)));
          toast.success(`Successfully published ${selectedAgentsToPublish.size} connected agent(s)`);
        } catch (error) {
          console.error("Error publishing connected agents:", error);
          toast.warning("Main agent published, but some connected agents failed to publish");
        }
      }

      // Handle embed user callback
      if (isEmbedUser) {
        sendDataToParent("published", {
          name: agent_name,
          agent_description: agent_description,
          agent_id: params?.id,
          agent_version_id: searchParams?.version
        }, "Agent Published Successfully");
      }

      dispatch(getAllBridgesAction());
      closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
    } catch (error) {
      if (isPublicAgent) {
        toast.error("Failed to save configuration. The slug name may already be in use.");
      }
      console.error("Error publishing bridge:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, params, searchParams, isPublicAgent, formData, agent_name, agent_description, isEmbedUser, selectedAgentsToPublish]);

  return (
    <Modal MODAL_ID={MODAL_TYPE.PUBLISH_BRIDGE_VERSION}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-low-medium overflow-auto h-auto bg-base-100">
        <div 
          className="bg-base-100 mb-auto mt-auto rounded-lg shadow-2xl max-w-6xl w-[90vw] my-8 flex flex-col p-6 md:p-10 transition-all duration-300 ease-in-out animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Publish Bridge Version</h2>
            <div className="flex gap-2">
              <button
                onClick={toggleComparison}
                className={`btn btn-sm btn-outline flex gap-1 ${!showComparison ? 'hidden' : 'block'}`}
                title="Compare Version Changes"
              >
                <ArrowRightLeft size={16} />
                {showComparison ? 'Hide Changes' : 'View Changes'}
              </button>
              <button
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Warning Section */}
          {!showComparison && (
            <div className="alert bg-base/70 mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <h3 className="font-medium">Are you sure you want to publish this version?</h3>
                </div>
                <div className="pl-7">
                  <p className="text-sm">Keep these important points in mind:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1 text-sm">
                    <li>Published version will be available to all users</li>
                    <li>Changes will be immediately reflected in the published version</li>
                    <li>Published changes cannot be reverted</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Changes Summary */}
          {!showComparison && (
            <div className="mb-6">
              <div className="bg-base-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Changes Summary</h3>
                  {Object.keys(changesSummary).length > 0 && (
                    <button
                      className="btn btn-sm btn-outline flex gap-1"
                      onClick={toggleComparison}
                    >
                      <ArrowRightLeft size={16} />
                      View All Changes
                    </button>
                  )}
                </div>

                {Object.keys(changesSummary).length === 0 ? (
                  <div className="alert alert-success">
                    <Check />
                    <span>No differences found between the versions.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Extracted config changes */}
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(extractedConfigChanges).length > 0 && (
                            Object.keys(extractedConfigChanges).map(key => (
                              <div key={key} className="card bg-base-100">
                                <div className="card-body p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="card-title text-sm">{DIFFERNCE_DATA_DISPLAY_NAME(key)}</h5>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                        {Object.keys(changesSummary)
                          .filter(key => !Object.keys(extractedConfigChanges).includes(key))
                          .map(key => (
                            <div key={key} className="card bg-base-100">
                              <div className="card-body p-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="card-title text-sm">{DIFFERNCE_DATA_DISPLAY_NAME(key)}</h5>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    
                  </div>
                )}
              </div>
              
              {/* Connected Agents Section */}
              {isLoadingAgents ? (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="mt-3 text-sm text-base-content/70">Loading connected agents...</p>
                  </div>
                </div>
              ) : allConnectedAgents.length > 1 ? (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      Connected Agents ({allConnectedAgents.length - 1})
                    </h4>
                    
                    {/* Select All option */}
                    {allConnectedAgents.filter(agent => agent._id !== params?.id && agent?.haveToPublish).length > 1 && (
                      <button 
                        onClick={toggleSelectAllAgents}
                        className="btn btn-sm btn-outline flex gap-1"
                      >
                        {allConnectedAgents
                          .filter(agent => agent._id !== params?.id && agent?.haveToPublish)
                          .every(agent => selectedAgentsToPublish.has(agent._id)) 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </button>
                    )}
                  </div>
                
                  <div className="space-y-3">
                    {allConnectedAgents
                      .filter(agent => agent._id !== params?.id && !agentList.filter(oneAgent => oneAgent._id === params?.id)?.[0]?.versions.includes(agent._id))
                      .map(agent => {
                        const isSelected = selectedAgentsToPublish.has(agent._id);
                        
                        return (
                          <div key={agent._id} className="card bg-base-100 shadow-sm border border-base-300">
                            <div className="card-body p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Bot className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium text-sm">{agent.name}</h5>
                                      {agent?.haveToPublish ? (
                                        <div className="badge badge-warning badge-sm text-white">Needs Publish</div>
                                      ) : (
                                        <div className="badge badge-success badge-sm text-white">Already Published</div>
                                      )}
                                    </div>
                                    <p className="text-xs text-base-content/70 mt-1">
                                      Service: {agent.service} | Model: {agent.configuration?.model || 'N/A'}
                                    </p>
                                    {agent.slugName && (
                                      <p className="text-xs text-base-content/50">
                                        Slug: {agent.slugName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {agent?.haveToPublish && (
                                  <div className="flex items-center gap-2">
                                    {agent?.haveToPublish && isSelected && (
                                    <div className="flex items-center gap-1 text-warning text-sm">
                                      <AlertTriangle className="w-3 h-3" />
                                      Version {getVersionIndexToPublish(agent._id, agent?.haveToPublish)} will be Published | 

                                    </div>
                                  )}
                                    <span className="text-xs text-base-content/70">Include in publish</span>
                                    <input
                                      type="checkbox"
                                      className="toggle toggle-primary toggle-sm"
                                      checked={isSelected}
                                      onChange={() => toggleAgentSelection(agent._id)}
                                      disabled={isLoading}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Full Data Comparison View */}
          {showComparison && (
            <div>
              <div className="bg-base-100 rounded-lg p-2">
                <PublishVersionDataComparisonView
                  oldData={filteredBridgeData}
                  newData={filteredVersionData}
                  showOnlyDifferences={true}
                  onClose={toggleComparison}
                  params={params}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Public Agent Toggle */}
            {/* <div className="bg-base-200/30 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-base-content">Make Public Agent</h4>
                <p className="text-sm text-base-content/70">
                  Allow this agent to be accessible publically without requiring authentication, Check GTWY agents <a href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/publicAgent`} className="underline text-blue-500" target="_blank" rel="noopener noreferrer">here</a>
                </p>
              </div>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isPublicAgent}
                  onChange={(e) => setIsPublicAgent(e.target.checked)}
                />
              </label>
            </div>
          </div>
        </div> */}

            {/* Public Agent Configuration Form */}
            {isPublicAgent && (
              <div className="bg-base-200/50 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h4 className="font-medium text-base-content">Public Agent Configuration</h4>
                </div>

                <div className="space-y-6">
                  {/* Slug Name Field */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">
                        Slug Name <span className="text-error">*</span>
                      </span>
                      <span className="label-text-alt text-xs text-base-content/60">
                        Must be globally unique
                      </span>
                    </label>
                    <input
                      type="text"
                      name="url_slugname"
                      placeholder="Enter a unique slug name"
                      className={`input input-bordered w-full ${error?.error ? 'input-error' : ''}`}
                      value={formData.url_slugname}
                      onChange={handleChange}
                      required
                    />
                    {error?.error && (
                      <label className="label">
                        <span className="label-text-alt text-error">{error?.error}</span>
                      </label>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      name="description"
                      placeholder="Enter a description"
                      className="textarea textarea-bordered w-full h-20"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Visibility Field */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Visibility</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private (Only allowed users can access)</option>
                    </select>
                  </div>

                  {/* Allowed Users Field */}
                  {formData.availability === 'private' && (
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium">Allowed Users</span>
                      </label>

                      {formData.allowedUsers?.length > 0 && (
                        <div className="mb-3 p-3 bg-base-200/50 rounded-lg min-h-[3rem]">
                          <div className="flex flex-wrap gap-2">
                            {formData.allowedUsers.map((user, index) => (
                              <div
                                key={index}
                                className="badge badge-outline gap-2 py-3 px-3"
                              >
                                <span className="text-sm">{user}</span>
                                <button
                                  onClick={() => handleRemoveUser(index)}
                                  className="hover:text-error transition-colors"
                                  type="button"
                                >
                                  <CircleX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="join w-full">
                        <input
                          type="email"
                          placeholder="Enter email address"
                          className="input input-bordered join-item flex-1"
                          value={formData.newEmail || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              newEmail: e.target.value
                            }))
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEmail();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn join-item"
                          onClick={handleAddEmail}
                          disabled={!formData.newEmail || !formData.newEmail.includes('@')}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              className="btn"
              onClick={handleCloseModal}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
              onClick={handlePublishBridge}
              disabled={isLoading || (isPublicAgent && !formData.url_slugname.trim())}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {isPublicAgent ? 'Saving & Publishing...' : 'Publishing...'}
                </>
              ) : (
                <>
                  {isPublicAgent ? 'Save & Publish' : 'Confirm Publish'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="modal-backdrop" onClick={handleCloseModal}></div>
    </Modal>
  );
}

export default Protected(PublishBridgeVersionModal);
