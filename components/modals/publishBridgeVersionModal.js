import React, { useCallback, useState, useMemo } from "react";
import { X, AlertTriangle, Settings, CircleX, ArrowRightLeft, Check } from "lucide-react";
import {
  getAllBridgesAction,
  publishBridgeVersionAction,
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

  const { bridge, versionData, bridgeData, apikeyData, functionData, knowledgeBaseData } = useCustomSelector((state) => ({
    bridge: state.bridgeReducer.allBridgesMap?.[params?.id]?.page_config,
    versionData: state.bridgeReducer.bridgeVersionMapping?.[params?.id]?.[searchParams?.version],
    bridgeData: state.bridgeReducer.allBridgesMap?.[params?.id],
    apikeyData: state?.bridgeReducer?.apikeys[params.org_id] || [],
    functionData: state?.bridgeReducer?.org[params.org_id]?.functionData || {},
    knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params.org_id] || []
  }));

  const toggleComparison = () => setShowComparison(prev => !prev); 
  const filterDataByKeys = (data = [], keysToExtract = []) => {
    const filteredItem = {};
    keysToExtract?.forEach(key => {
      if ((key in data)) {
        filteredItem[key] = data[key];
      }
    });
    return filteredItem;
  };

  const filteredBridgeData = filterDataByKeys(bridgeData, KEYS_TO_COMPARE);
  const filteredVersionData = filterDataByKeys(versionData, KEYS_TO_COMPARE);

  // Function to find differences between objects
  const findDifferences = (obj1, obj2) => {
    if (!obj1 || !obj2) return {};

    const differences = {};
    const allKeys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];

    allKeys.forEach(key => {
      // Skip if both are undefined or null
      if (!obj1[key] && !obj2[key]) return;

      // If key exists in both objects
      if (key in obj1 && key in obj2) {
        // If values are different
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          differences[key] = {
            oldValue: obj1[key],
            newValue: obj2[key],
            status: 'changed'
          };
        }
      }
      // If key exists only in obj1
      else if (key in obj1) {
        differences[key] = {
          oldValue: obj1[key],
          newValue: undefined,
          status: 'removed'
        };
      }
      // If key exists only in obj2
      else {
        differences[key] = {
          oldValue: undefined,
          newValue: obj2[key],
          status: 'added'
        };
      }
    });

    return differences;
  };

  // Calculate differences between bridge and version data
  const differences = useMemo(() => findDifferences(filteredBridgeData, filteredVersionData), [filteredBridgeData, filteredVersionData]);

  // Extract important configuration changes to show at the top level
  const extractedConfigChanges = useMemo(() => {
    const extracted = {};
    

    // Check if configuration has changed
    if (differences.configuration) {
      // Extract model change
      if (filteredBridgeData.configuration?.model !== filteredVersionData.configuration?.model) {
        extracted.model = {
          oldValue: filteredBridgeData.configuration?.model,
          newValue: filteredVersionData.configuration?.model,
          status: 'changed'
        };
      }

      // Extract prompt change
      if (filteredBridgeData.configuration?.prompt !== filteredVersionData.configuration?.prompt) {
        extracted.prompt = {
          oldValue: filteredBridgeData.configuration?.prompt,
          newValue: filteredVersionData.configuration?.prompt,
          status: 'changed'
        };
      }
    }

    // Extract service change
    if (differences.service) {
      extracted.service = {
        oldValue: filteredBridgeData.service,
        newValue: filteredVersionData.service,
        status: differences.service.status
      };
    }

    return extracted;
  }, [differences, filteredBridgeData, filteredVersionData]);
  
  // Get a count of changes by category
  const changesSummary = useMemo(() => {
    const summary = {};

    // Add main category changes
    Object.keys(differences).forEach(key => {
      summary[key] = differences[key].status;
    });

    // Add extracted configuration changes
    Object.keys(extractedConfigChanges).forEach(key => {
      summary[key] = extractedConfigChanges[key].status;
    });

    return summary;
  }, [differences, extractedConfigChanges]);

  const [formData, setFormData] = useState({
    url_slugname: bridge?.url_slugname || '',
    availability: bridge?.availability || 'public',
    description: bridge?.description || "",
    allowedUsers: bridge?.allowedUsers || [],
    newEmail: ''
  });

  const handleCloseModal = useCallback((e) => {
    e?.preventDefault();
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'url_slugname') {
      processedValue = value.replace(/\s+/g, '_');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleAddEmail = () => {
    if (formData.newEmail && formData.newEmail.includes('@')) {
      if (formData.allowedUsers.includes(formData.newEmail)) {
        toast.warn("This email has already been added.");
        return;
      }
      setFormData(prev => ({
        ...prev,
        allowedUsers: [...(prev.allowedUsers || []), prev.newEmail],
        newEmail: ''
      }));
    }
  };

  const handleRemoveUser = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handlePublishBridge = useCallback(async () => {
    setIsLoading(true);

    try {
      // If user wants to make it a public agent, first save the configuration
      if (isPublicAgent) {
        if (!formData.url_slugname.trim()) {
          toast.error("Slug Name is required.");
          setIsLoading(false);
          return;
        }

        // Save the public agent configuration first
        const payload = {
          page_config: {
            url_slugname: formData.url_slugname,
            availability: formData.availability,
            description: formData.description,
            allowedUsers: formData.availability === 'private' ? formData.allowedUsers : [],
          }
        };

        try {
          const response = await dispatch(updateBridgeAction({
            bridgeId: params?.id,
            dataToSend: payload
          }));
        } catch (error) {
          if (error?.response?.data?.detail?.includes('DuplicateKey')) {
            setError({ "error": 'This slug name already exists. Please choose a different one.' });
          }
          setIsLoading(false);
          return;
        }
        toast.success("Configuration saved successfully!");
      }

      // Then publish the bridge version
      await dispatch(
        publishBridgeVersionAction({
          bridgeId: params?.id,
          versionId: searchParams?.version,
          orgId: params?.org_id,
          isPublic: isPublicAgent,
        })
      );

      isEmbedUser && sendDataToParent("published", { name: agent_name, agent_description: agent_description, agent_id: params?.id, agent_version_id: searchParams?.version }, "Agent Published Successfully")

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
  }, [dispatch, params, isPublicAgent, formData, agent_name, agent_description, isEmbedUser]);

  return (
    <Modal MODAL_ID={MODAL_TYPE.PUBLISH_BRIDGE_VERSION}>
      <div className="modal-box w-11/12 max-w-7xl max-h-[96vh] overflow-y-auto bg-base-100">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Publish Bridge Version</h2>
            <div className="flex gap-2 ">
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
          {!showComparison && <div className="alert bg-base/70 mb-6">
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
          </div>}

          {/* Changes Summary - Always visible */}
          {!showComparison && <div className="mb-6">
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
                <div className="space-y-4">
                  {/* Show extracted config changes first */}
                  {Object.keys(extractedConfigChanges).length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-4">
                        {Object.keys(extractedConfigChanges).map(key => (
                          <div key={key} className="card bg-base-100">
                            <div className="card-body p-3">
                              <div className="flex justify-between items-center">
                                <h5 className="card-title text-sm">{DIFFERNCE_DATA_DISPLAY_NAME(key)}</h5>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show other category changes */}
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(changesSummary)
                        // Filter out keys that are already shown in extracted config
                        .filter(key => !Object.keys(extractedConfigChanges).includes(key))
                        .map(key => (
                          <div key={key} className="card bg-base-100">
                            <div className="card-body p-3">
                              <div className="flex justify-between items-center">
                                <h5 className="card-title text-sm">{DIFFERNCE_DATA_DISPLAY_NAME(key)}</h5>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>}

          {/* Full Data Comparison View */}
          {showComparison && (
            <div className="">
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
