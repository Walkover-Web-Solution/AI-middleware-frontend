import React from 'react'
import { MODAL_TYPE } from '@/utils/enums'
import Modal from '../UI/Modal'

const EditMessageModal = ({modalRef,setModalInput,handleClose,handleSave,modalInput}) => {
  return (
    <Modal MODAL_ID={MODAL_TYPE.EDIT_MESSAGE_MODAL}>
    <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Enter your input:</span>
        </label>
        <textarea
          className="input input-bordered textarea min-h-[200px]"
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  </Modal>
  )
}

export default EditMessageModal