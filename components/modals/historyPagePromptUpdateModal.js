import { updateBridgeVersionAction } from '@/store/action/bridgeAction'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React from 'react'
import { useDispatch } from 'react-redux'
import Modal from '../UI/Modal'

const HistoryPagePromptUpdateModal = ({searchParams, previousPrompt, promotToUpdate, onSave }) => {
  const dispatch  = useDispatch();

  const handleClose = () => {
    closeModal(MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const newValue = promotToUpdate?.trim() || "";
    if (newValue !== previousPrompt) {
        dispatch(updateBridgeVersionAction({ versionId: searchParams?.version, dataToSend: { configuration: { prompt: newValue } } }));
    }
    handleClose()
  }

  return (
    <Modal MODAL_ID={MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL}>
      <div className="modal-box w-11/12 max-w-7xl bg-base-100">
        <h3 className="font-bold text-lg mb-4">Update Prompt</h3>
        <div className='flex gap-3 w-full'>
          <div className='w-full'>
            <div className="label">
              <span className="label-text">Previous Prompt</span>
            </div>
            <textarea
              className="textarea bg-white dark:bg-black/15 textarea-bordered border border-base-300 w-full min-h-96 focus:border-primary caret-base-content p-2"
              key={previousPrompt}
              defaultValue={previousPrompt}
              readOnly
            />
          </div>
          <div className='w-full'>
            <div className="label">
              <span className="label-text">Updated Prompt</span>
            </div>
            <textarea
              className="textarea bg-white dark:bg-black/15 textarea-bordered border border-base-300 w-full min-h-96 focus:border-primary caret-base-content p-2"
              key={promotToUpdate}
              defaultValue={promotToUpdate}
              readOnly
            />
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm" onClick={handleClose}>Cancel</button>
            <button className="btn btn-sm btn-primary ml-2" onClick={handleSave}>Save</button>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default HistoryPagePromptUpdateModal
