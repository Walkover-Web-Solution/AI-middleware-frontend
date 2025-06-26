import { createIntegrationAction } from '@/store/action/integrationAction'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import React from 'react'
import { useDispatch } from 'react-redux'

const IntegrationModal = ({ orgId }) => {
  const integrationNameRef = React.useRef('');
  const dispatch = useDispatch();
  const handleCreateNewIntegration = () => {
    dispatch(createIntegrationAction({
      name: integrationNameRef?.current?.value,
      orgId
    }))
    closeModal(MODAL_TYPE.INTEGRATION_MODAL);
    integrationNameRef.current.value = '';
  }
  return (

    <dialog id={MODAL_TYPE.INTEGRATION_MODAL} className="modal">
      <div className='modal-box'>
        <h3 className="font-bold text-lg mb-4">Enter Integration Name</h3>
        <input
          type="text"
          placeholder="Enter integration name"
          className="input input-bordered input-md w-full mb-2 placeholder-opacity-50"
          ref={integrationNameRef}
        />
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => { closeModal(MODAL_TYPE.INTEGRATION_MODAL); integrationNameRef.current.value = ''; }}>Close</button>
            <button className="btn btn-primary ml-2" onClick={handleCreateNewIntegration}>Create</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default IntegrationModal