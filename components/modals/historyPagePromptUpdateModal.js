import { updateBridgeVersionAction } from '@/store/action/bridgeAction'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React from 'react'
import { useDispatch } from 'react-redux'

const HistoryPagePromptUpdateModal = ({params, previousPrompt, promotToUpdate, onSave }) => {
  const dispatch  = useDispatch();

  const handleClose = () => {
    closeModal(MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const newValue = promotToUpdate?.trim() || "";
    if (newValue !== previousPrompt) {
        dispatch(updateBridgeVersionAction({ versionId: params.version, dataToSend: { configuration: { prompt: newValue } } }));
    }
    handleClose()
  }

  return (
    <dialog id={MODAL_TYPE.HISTORY_PAGE_PROMPT_UPDATE_MODAL} className="modal">
      <div className="modal-box w-11/12 max-w-7xl bg-white">
        <h3 className="font-bold text-lg mb-4">Update Prompt</h3>
        <div className='flex gap-3 w-full'>
          <div className='w-full'>
            <div className="label">
              <span className="label-text">Previous Prompt</span>
            </div>
            <textarea
              className="textarea textarea-bordered border w-full min-h-96 focus:border-primary caret-black p-2"
              value={previousPrompt}
              readOnly
            />
          </div>
          <div className='w-full'>
            <div className="label">
              <span className="label-text">Updated Prompt</span>
            </div>
            <textarea
              className="textarea textarea-bordered border w-full min-h-96 focus:border-primary caret-black p-2"
              value={promotToUpdate}
              readOnly
            />
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary ml-2" onClick={handleSave}>Save</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default HistoryPagePromptUpdateModal
