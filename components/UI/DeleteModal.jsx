import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { ClipboardXIcon } from '../Icons';

const DeleteModal = ({   
  onConfirm = () => {}, 
  onCancel,
  item,
  name,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete selected file.",
  buttonTitle = "Delete",
  modalType = MODAL_TYPE.DELETE_MODAL
}) => {
const handleClose=()=>{
    if (onCancel) {
      onCancel();
    } else {
      closeModal(modalType);
    }
}

  return (
    <Modal MODAL_ID={modalType}>
    <div 
      className=" flex items-center justify-center "
    >
      <div 
        className="w-full max-w-lg bg-base-100 border border-base-300 rounded-lg  p-6 mx-4 "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-base-content">
            {title}
          </h2>
          <p className="text-sm text-base-content">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={()=>{
                onConfirm(item,name)
            }}
            className="btn btn-error text-white btn-sm"
          >
            {buttonTitle ? <ClipboardXIcon size={14} className='text-white'/> :  <Trash2 className="mr-1 h-4 w-4 text-white" />}
            {buttonTitle}
          </button>
        </div>
      </div>
    </div>
    </Modal>
  );
};
 export default DeleteModal;
