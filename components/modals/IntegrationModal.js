import { createIntegrationAction } from '@/store/action/integrationAction'
import { MODAL_TYPE } from '@/utils/enums'
import { closeModal, RequiredItem } from '@/utils/utility'
import React from 'react'
import { useDispatch } from 'react-redux'
import Modal from '@/components/UI/modal'
import { toast } from 'react-toastify'

const IntegrationModal = ({ params }) => {
  const integrationNameRef = React.useRef('');
  const dispatch = useDispatch();
  const handleCreateNewIntegration = () => {
    if(integrationNameRef?.current?.value?.trim()===""){
     toast.error("Integration name should not be empty");
      return;
    }
    dispatch(createIntegrationAction({
      name: integrationNameRef?.current?.value,
      orgId: params.org_id,
      config:{
            "hideHomeButton": false,
            "showGuide": true,
            "showHistory": false,
            "showConfigType": false,
            "slide": "right",
            "defaultOpen": true,
            "hideFullScreenButton": false,
            "hideCloseButton": false,
            "hideHeader": false,
            "hideAdvancedParameters": false,
            "hideAdvancedConfigurations": false,
            "hidePreTool": false,
            "hideCreateManuallyButton": false
        }
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
          className="input input-bordered input-sm w-full mb-2 placeholder-opacity-50"
          maxLength={50}
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
            <button className="btn btn-sm" onClick={() => { closeModal(MODAL_TYPE.INTEGRATION_MODAL); integrationNameRef.current.value = ''; }}>Close</button>
            <button className="btn btn-sm btn-primary ml-2" onClick={handleCreateNewIntegration}>Create</button>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default IntegrationModal