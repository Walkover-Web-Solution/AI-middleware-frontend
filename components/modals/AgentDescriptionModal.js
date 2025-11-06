import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React from 'react'
import Modal from '../UI/Modal'

const AgentDescriptionModal = ({ setDescription, handleSaveAgent, description, isAgentToAgentConnect = true }) => {
    return (
        <Modal MODAL_ID={MODAL_TYPE?.AGENT_DESCRIPTION_MODAL}>
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg">Add Agent Description</h3>
                <div className="py-4">
                    <label className="label">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        className="textarea bg-white dark:bg-black/15 textarea-bordered w-full h-32"
                        placeholder="Enter description for the agent..."
                        defaultValue={description}
                        key={description}
                        required
                        onBlur={(e) => setDescription(e.target.value?.trim())}
                    ></textarea>
                </div>
                <div className="modal-action">
                    <button className="btn btn-sm" onClick={() => closeModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL)}>Cancel</button>
                    <button className="btn btn-sm btn-primary" onClick={() => handleSaveAgent()}>{isAgentToAgentConnect ? 'Save' : 'Add Agent'}</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </Modal>
    )
}

export default AgentDescriptionModal