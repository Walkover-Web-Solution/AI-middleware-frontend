import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React, { useState } from 'react'
import Modal from '../UI/Modal'
import { useEnterKeySubmit } from '@/customHooks/useEnterKeySubmit'

const VersionDescriptionModal = ({ versionDescriptionRef, handleCreateNewVersion }) => {
  const [inputValue, setInputValue] = useState('');
  const handleEnterKeyDown = useEnterKeySubmit(() => {
    handleCreateNewVersion();
    closeModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL);
    versionDescriptionRef.current.value = '';
    setInputValue('');
  }, []);
  
  return (
    <Modal MODAL_ID={MODAL_TYPE.VERSION_DESCRIPTION_MODAL}>
      <div className='modal-box'>
        <h3 className="font-bold text-lg mb-4">Create New Version</h3>
        <input
          type="text"
          placeholder="Enter version description"
          className="input input-bordered input-md w-full mb-2 placeholder-opacity-50"
          ref={versionDescriptionRef}
          onChange={(e) => { setInputValue(e.target.value); versionDescriptionRef.current.value = e.target.value; }}
          onKeyDown={handleEnterKeyDown}
        />
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm" onClick={() => { closeModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL); versionDescriptionRef.current.value = ''; setInputValue(''); }}>Close</button>
            <button className="btn btn-sm btn-primary ml-2" onClick={handleCreateNewVersion} disabled={!inputValue.trim()}>Create</button>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default VersionDescriptionModal