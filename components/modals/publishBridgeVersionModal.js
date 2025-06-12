import React, { useCallback, useState } from "react";
import { X, AlertTriangle, Settings, Upload } from "lucide-react";
import PublicAgentForm from "../chatbotConfiguration/PublicAgentForm";
import {
  publishBridgeVersionAction,
} from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import { useDispatch } from "react-redux";


function PublishBridgeVersionModal({ params }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = useCallback((e) => {
    e?.preventDefault();
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
  }, []);

  const handlePublishBridge = useCallback(async () => {
    setIsLoading(true);
    await dispatch(
      publishBridgeVersionAction({
        bridgeId: params?.id,
        versionId: params?.version,
        orgId: params?.org_id,
      })
    );
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
    setIsLoading(false);
  }, [dispatch, params]);

  return (
    <dialog id={MODAL_TYPE.PUBLISH_BRIDGE_VERSION} className="modal">
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
        <div className="flex items-center gap-2 mb-2 ml-2">
          <AlertTriangle className="h-6 w-6" />
          <p>
          Are you sure you want to publish this version? Keep in mind these points.
          </p>
        </div>

        {/* Warning Points */}
        <div className="bg-base-100 border border-base-300 rounded-lg p-4 mb-6">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-warning mt-1">•</span>
              <span>Once published, the version will be available to all users.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-warning mt-1">•</span>
              <span>Any changes made to the version will be reflected in the published version.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-warning mt-1">•</span>
              <span>Once published, changes cannot be reverted.</span>
            </li>
          </ul>
        </div>

        {/* Configuration Section */}
        <div className="collapse collapse-arrow bg-base-200 mb-6">
          <input type="checkbox" defaultChecked />
          <div className="collapse-title text-lg font-medium flex items-center gap-2">
            <Settings className="h-5 w-5 text-base-content" />
            Public Chatbot Configuration
          </div>
          <div className="collapse-content">
            <div className="pt-2">
              <div className="text-sm text-base-content/70 mb-4">
                Configure your chatbot settings before publishing
              </div>
              <div className="bg-base-100 p-6 rounded-lg border border-base-300">
                <p className="text-center text-base-content/60">
                  <PublicAgentForm params={params} />
                </p>
              </div>
            </div>
          </div>
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
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Publishing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Confirm Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal backdrop */}
      <div className="modal-backdrop" onClick={handleCloseModal}></div>
    </dialog>
  );
}

export default PublishBridgeVersionModal;
