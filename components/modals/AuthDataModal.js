import React from 'react'
import Modal from '../UI/Modal'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import { CloseIcon } from '../Icons'

const AuthDataModal = ({ data }) => {
  return (
    <Modal MODAL_ID={MODAL_TYPE?.AUTH_DATA_MODAL}>
      <div className="modal-box max-w-7xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Authentication Details</h2>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => closeModal(MODAL_TYPE?.AUTH_DATA_MODAL)}
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input 
              type="text"
              className="input input-bordered w-full"
              value={data?.name || ''}
              readOnly
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Client ID</span>
            </label>
            <input
              type="text" 
              className="input input-bordered w-full"
              value={data?.client_id || ''}
              readOnly
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Redirection URL</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={data?.redirection_url || ''}
              readOnly
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AuthDataModal