import React, { useState } from 'react'
import Modal from '../UI/Modal'
import { Save, Upload } from 'lucide-react'
import { closeModal } from '@/utils/utility'
import { MODAL_TYPE } from '@/utils/enums'

const CreateNewOrchestralFlowModal = ({ handleCreateNewFlow, createdFlow, saveData, setSaveData }) => {
    const handleChange = (e) => {
        setSaveData({ ...saveData, [e.target.name]: e.target.value })
    }

    return (
        <div>
            <Modal MODAL_ID={MODAL_TYPE.CREATE_ORCHESTRAL_FLOW_MODAL}>
                <div className="modal-box w-11/12 max-w-lg bg-base-100">
                    <h3 className="card-title">
                        {createdFlow ? <Save className="mr-2 h-5 w-5 opacity-70" /> : <Upload className="mr-2 h-5 w-5 opacity-70" />}
                        {createdFlow ? 'Update Agent Flow' : 'Save Agent Flow'}
                    </h3>

                    <div className="form-control mt-2">
                        <label className="label">
                            <span className="label-text">
                                Flow Name <span className="text-error">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={saveData?.name}
                            onChange={handleChange}
                            placeholder="Enter flow name..."
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div className="form-control mt-2">
                        <label className="label">
                            <span className="label-text">Description</span>
                        </label>
                        <textarea
                            name="description"
                            value={saveData?.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter flow description..."
                            className="textarea textarea-bordered w-full resize-none"
                        />
                    </div>

                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-ghost" onClick={() => { closeModal(MODAL_TYPE.CREATE_ORCHESTRAL_FLOW_MODAL); setSaveData({ ...saveData, name: '', description: '' }) }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreateNewFlow}>
                            {createdFlow ? <Upload className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            {createdFlow ? 'Update Flow' : 'Create Flow'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default CreateNewOrchestralFlowModal