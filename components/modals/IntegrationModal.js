import { createIntegrationAction } from '@/store/action/integrationAction'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal, RequiredItem } from '@/utils/utility'
import React from 'react'
import { useDispatch } from 'react-redux'
import Modal from '@/components/UI/Modal'

const IntegrationModal = ({ params }) => {
  const integrationNameRef = React.useRef('');
  const dispatch = useDispatch();
  const handleCreateNewIntegration = () => {
    dispatch(createIntegrationAction({
      name: integrationNameRef?.current?.value,
      orgId: params.org_id
    }))
    closeModal(MODAL_TYPE.INTEGRATION_MODAL);
    integrationNameRef.current.value = '';
  }
  return (
    <Modal MODAL_ID={MODAL_TYPE.INTEGRATION_MODAL}>
      <div className='modal-box'>
        <h3 className="font-bold text-lg mb-4">Enter Integration Name{RequiredItem()}</h3>
        <input
          type="text"
          placeholder="Enter integration name"
          className="input input-bordered input-md w-full mb-2 placeholder-opacity-50"
          ref={integrationNameRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateNewIntegration();
            }
          }}
        />
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => { closeModal(MODAL_TYPE.INTEGRATION_MODAL); integrationNameRef.current.value = ''; }}>Close</button>
            <button className="btn btn-primary ml-2" onClick={handleCreateNewIntegration}>Create</button>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default IntegrationModal