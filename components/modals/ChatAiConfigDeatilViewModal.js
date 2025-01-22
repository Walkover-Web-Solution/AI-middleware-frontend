import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import { CircleX } from 'lucide-react'
import React from 'react'

const ChatAiConfigDeatilViewModal = ({modalContent}) => {
  return (
    <dialog id="chat_details_view" className="modal">
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] overflow-auto min-w-[100vw] h-auto">
        <div className="bg-white p-4 rounded shadow-lg max-w-6xl w-[90vw] relative">
          <button
            className="absolute top-6 right-5"
            onClick={() => closeModal(MODAL_TYPE.CHAT_DETAILS_VIEW_MODAL)}
          >
            <CircleX size={24} />
          </button>
          <h3 className="text-lg font-semibold mb-2 p-2">Detailed View</h3>
          <div className="bg-gray-200 p-4 rounded text-sm overflow-auto h-auto max-h-[80vh] ">
            {Object.entries(modalContent || {}).map(([key, value]) => (
              <div key={key} className="mb-2">
                <strong className="">{key}:</strong>
                {Array?.isArray(value) ? (
                  <ul className="list-disc list-inside ml-4">
                    {value?.map((item, index) => (
                      <li key={index} className="break-words">
                        {typeof item === 'object' && item !== null ? (
                          <pre className="ml-4 bg-gray-100 p-2 rounded break-words whitespace-pre-wrap">{JSON?.stringify(item, null, 2)}</pre>
                        ) : (
                          <span className="break-words">{JSON?.stringify(item)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-700 ml-2">{JSON?.stringify(value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default ChatAiConfigDeatilViewModal