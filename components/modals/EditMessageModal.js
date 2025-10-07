import React from 'react'
import { MODAL_TYPE } from '@/utils/enums'
import Modal from '../UI/Modal'
import { Zap } from 'lucide-react'

const EditMessageModal = ({setModalInput,handleClose,handleSave,modalInput,handleImprovePrompt}) => {
  return (
    <Modal MODAL_ID={MODAL_TYPE.EDIT_MESSAGE_MODAL}>
    <div className="bg-base-100 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
      
      {/* Instructions */}
      <div className="alert alert-info mb-4">
        <div className="text-sm">
          <strong>💡 Tip:</strong> Edit your prompt above, then click "Update Response" to regenerate the AI response with your improved prompt.
        </div>
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Enter your input:</span>
        </label>
        <textarea
          className="input input-bordered textarea min-h-[200px]"
          defaultValue={modalInput?.content}
          key={modalInput?.Id}
          onBlur={(e) => setModalInput({
            ...modalInput,
            content: e.target.value
          })}
        />
        
        {/* Improve Prompt Button */}
        <div className="mt-3">
          <button 
            className="btn btn-outline btn-sm gap-2"
            disabled={modalInput?.content?.trim() === ''}
            onClick={handleImprovePrompt}
          >
            <Zap />
            Improve Prompt
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn" onClick={handleClose}>
          Cancel
        </button>
        <button 
        disabled={modalInput?.content?.trim() === ''}
        className="btn btn-primary" onClick={handleSave}>
          Update Response
        </button>
      </div>
    </div>
  </Modal>
  )
}

export default EditMessageModal