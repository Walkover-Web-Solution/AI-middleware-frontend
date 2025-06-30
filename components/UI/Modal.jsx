import React from 'react'

const Modal = ({MODAL_ID, children, modalRef }) => {
  return (
    <dialog id = {MODAL_ID} className='modal' ref={modalRef} >
      {children}
    </dialog>
  )
}

export default Modal