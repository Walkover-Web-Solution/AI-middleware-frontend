import {
  getAllBridgesAction,
  publishBridgeVersionAction,
} from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import React, {  useCallback } from "react";
import { useDispatch } from "react-redux";
import Modal from "../UI/Modal";
import Protected from "../protected";
``

function PublishBridgeVersionModal({ params, agent_name, agent_description,  isEmbedUser }) {
  const dispatch = useDispatch();

  const handleCloseModal = useCallback((e) => {
    e?.preventDefault();
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
  }, []);

  const handlePublishBridge = useCallback(async () => {
    await dispatch(
      publishBridgeVersionAction({
        bridgeId: params?.id,
        versionId: params?.version,
        orgId: params?.org_id,
      })
    );
    isEmbedUser && window.parent.postMessage({type: 'gtwy', status:"agent_published", data:{ "agent_id":params?.id,"agent_name": agent_name, agent_description: agent_description}}, '*');
    dispatch(getAllBridgesAction());
    closeModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION);
  }, [dispatch, params]);

  return (
    <Modal MODAL_ID={MODAL_TYPE.PUBLISH_BRIDGE_VERSION}>
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Publish Agent Version</h3>
        <p>
          Are you sure you want to publish this version? Keep in mind these
          points.
        </p>
        <ul className="list-disc ml-4 mt-3">
          <li>Once published, the version will be available to all users.</li>
          <li>
            Any changes made to the version will be reflected in the published
            version.
          </li>
          <li>Once published, changes cannot be reverted.</li>
        </ul>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={handleCloseModal}>
              Close
            </button>
            <button
              className="btn btn-primary ml-2"
              onClick={handlePublishBridge}
            >
              Confirm Publish
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

export default Protected(PublishBridgeVersionModal);
