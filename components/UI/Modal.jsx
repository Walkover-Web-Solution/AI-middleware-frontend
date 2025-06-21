import React from 'react'

const Modal = ({MODAL_ID, children}) => {
  return (
    <dialog id = {MODAL_ID} className='modal'>
        {children}
    </dialog>
  )
}

export default Modal