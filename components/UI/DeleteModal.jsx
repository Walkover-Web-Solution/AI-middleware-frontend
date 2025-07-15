import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';

const DeleteModal = ({   
  onConfirm = () => {}, 
  item,
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete selected file."
}) => {
const handleClose=()=>{
    closeModal(MODAL_TYPE.DELETE_MODAL);
}

  return (
    <Modal MODAL_ID={MODAL_TYPE.DELETE_MODAL}>
    <div 
      className=" flex items-center justify-center "
    >
      <div 
        className="w-full max-w-lg bg-white border border-gray-200 rounded-lg  p-6 mx-4 "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={()=>{
                onConfirm(item)
            }}
            className="btn btn-error text-base-100"
          >
            <Trash2 className="mr-1 h-4 w-4 text-base-100" />
            Delete
          </button>
        </div>
      </div>
    </div>
    </Modal>
  );
};
 export default DeleteModal;
