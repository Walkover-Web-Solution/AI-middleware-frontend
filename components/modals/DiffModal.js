import React from 'react'
import Modal from '../UI/Modal'
import ComparisonCheck from '@/utils/comparisonCheck'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility';
import { CloseIcon } from '@/components/Icons';

const Diff_Modal = ({oldContent,newContent}) => {
  console.log(oldContent,'oldContent')
  console.log(newContent,'newContent')
  return (
    <Modal MODAL_ID={MODAL_TYPE.DIFF_PROMPT}>
      <div className='modal-box max-w-[80%]' >
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              Compare Published Prompt and Current  Prompt
            </h3>
            <button
                onClick={()=>closeModal(MODAL_TYPE.DIFF_PROMPT)}
                className="btn btn-sm btn-ghost"
            >
                <CloseIcon />
            </button>
        </div>
        <ComparisonCheck oldContent={oldContent} newContent={newContent}></ComparisonCheck>
      </div>
    </Modal>
  )
}

export default Diff_Modal
