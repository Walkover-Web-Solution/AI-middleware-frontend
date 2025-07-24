import React, { useCallback, useState } from "react";
import { X, AlertTriangle, Settings, Globe, CircleX } from "lucide-react";
import {
  getAllBridgesAction,
  publishBridgeVersionAction,
  updateBridgeAction,
} from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import Modal from "../UI/Modal";
import { useCustomSelector } from '@/customHooks/customSelector';

function PublishBridgeVersionModal({ params, agent_name, agent_description, isEmbedUser }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublicAgent, setIsPublicAgent] = useState(false);

  const { bridge } = useCustomSelector((state) => ({
    bridge: state.bridgeReducer.allBridgesMap?.[params?.id]?.page_config
  }));

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

        await dispatch(updateBridgeAction({
          bridgeId: params?.id,
          dataToSend: payload
        }));

        toast.success("Configuration saved successfully!");
      }

      // Then publish the bridge version
      await dispatch(
        publishBridgeVersionAction({
          bridgeId: params?.id,
          versionId: params?.version,
          orgId: params?.org_id,
          isPublic: isPublicAgent,
        })
      );

      if (isEmbedUser) {
        window.parent.postMessage({
          type: 'gtwy',
          status: "agent_published",
          data: {
            "agent_id": params?.id,
            "agent_name": agent_name,
            "agent_description": agent_description
          }
        }, '*');
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
  }, [dispatch, params, isPublicAgent, formData, agent_name, agent_description, isEmbedUser]);

  return (
    <Modal MODAL_ID={MODAL_TYPE.PUBLISH_BRIDGE_VERSION}>
      <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-base-content">
            Publish Agent Version
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleCloseModal}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Section */}
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

        {/* Public Agent Toggle */}
        <div className="bg-base-200/30 p-4 rounded-lg mb-6">
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
        </div>

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
                  className="input input-bordered w-full"
                  value={formData.url_slugname}
                  onChange={handleChange}
                  required
                />
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

      <div className="modal-backdrop" onClick={handleCloseModal}></div>
    </Modal>
  );
}

export default PublishBridgeVersionModal;