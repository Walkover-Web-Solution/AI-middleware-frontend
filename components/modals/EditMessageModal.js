import React from 'react'

const EditMessageModal = ({modalRef,setModalInput,handleClose,handleSave,modalInput}) => {
  return (
    <dialog className="modal modal-bottom sm:modal-middle" ref={modalRef}>
    <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Enter your input:</span>
        </label>
        <textarea
          className="input input-bordered textarea min-h-[200px]"
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  </dialog>
  )
}

export default EditMessageModal