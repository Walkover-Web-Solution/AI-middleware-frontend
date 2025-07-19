import React from 'react'
import { MODAL_TYPE } from '@/utils/enums';
import Modal from '../UI/Modal';
import { closeModal } from '@/utils/utility';
import { useCustomSelector } from '@/customHooks/customSelector';

const ModelUsageDetailsModal = ({usageDetailsData}) => {
  const { allBridgesMap } = useCustomSelector((state) => ({
    allBridgesMap: state?.bridgeReducer?.allBridgesMap
  }));
  
  const handleClose = () => {
    closeModal(MODAL_TYPE.USAGE_DETAILS_MODAL);
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.USAGE_DETAILS_MODAL}>
      <div className="flex items-center justify-center">
        <div 
          className="w-full max-w-[50rem] bg-white border border-gray-200 rounded-lg p-6 mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Model Usage Details
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This model is currently being used by the following:
            </p>

            <div className="space-y-4">
              {usageDetailsData?.agents?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Agents ({usageDetailsData.agents.length})</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <ul className="list-disc pl-5">
                      {usageDetailsData.agents.map((agent, index) => (
                        <li key={index} className="text-sm py-1">
                          {agent.name} <span className="text-gray-500">(ID: {agent.id})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {usageDetailsData?.versions?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Versions ({usageDetailsData.versions.length})</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <ul className="list-disc pl-5">
                      {usageDetailsData.versions.map((version, index) => {
                        const bridge = Object.values(allBridgesMap).find(bridge => 
                          bridge.versions?.some(v => v === version.id || v._id === version.id)
                        );
                        return (
                          <li key={index} className="text-sm py-1">
                            {bridge?.name} <span className="text-gray-500">(Version #{index + 1}, ID: {version.id})</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ModelUsageDetailsModal