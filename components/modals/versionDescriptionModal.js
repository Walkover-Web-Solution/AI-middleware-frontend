import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React from 'react'

const VersionDescriptionModal = ({ versionDescriptionRef, handleCreateNewVersion }) => {
  return (
    <dialog id={MODAL_TYPE.VERSION_DESCRIPTION_MODAL} className="modal">
      <div className='modal-box'>
        <h3 className="font-bold text-lg mb-4">Create New Version</h3>
        <input
          type="text"
          placeholder="Enter version description"
          className="input input-bordered input-md w-full mb-2 placeholder-opacity-50"
          ref={versionDescriptionRef}
        />
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => { closeModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL); versionDescriptionRef.current.value = ''; }}>Close</button>
            <button className="btn btn-primary ml-2" onClick={handleCreateNewVersion}>Create</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default VersionDescriptionModal