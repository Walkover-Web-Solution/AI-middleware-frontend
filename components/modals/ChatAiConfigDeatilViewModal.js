import { MODAL_TYPE } from '@/utils/enums'
import { closeModal } from '@/utils/utility'
import { CloseCircleIcon } from '@/components/Icons'
import React from 'react'
import Modal from '../UI/Modal'

const flattenMessage = (message) => {
  if (typeof message !== 'object' || message === null) {
    return { 'message': message }
  }

  const result = {}
  const flatten = (obj, parentKey = '') => {
    Object.keys(obj).forEach(key => {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flatten(obj[key], newKey)
      } else {
        result[newKey] = obj[key]
      }
    })
  }
  
  flatten(message)
  return result
}

const formatValue = (value) => {
  if (typeof value === 'string' && value.startsWith('**') && value.includes('\n')) {
    return value.split('\n').map((line, index) => (
      <p key={index} className={line.startsWith('**') ? 'font-bold' : ''}>
        {line}
      </p>
    ))
  }
  return String(value)
}

const renderFlattenedMessage = (message) => {
  const flattened = flattenMessage(message)
  return Object.entries(flattened).map(([key, value]) => (
    <div key={key} className="mb-2 last:mb-0">
      <span className="font-medium">{key}:</span> {formatValue(value)}
    </div>
  ))
}

const ChatAiConfigDeatilViewModal = ({ modalContent }) => {
  return (
    <Modal MODAL_ID={MODAL_TYPE.CHAT_DETAILS_VIEW_MODAL}>
      <div className="fixed inset-0 bg-base-content/50 backdrop-blur-sm flex justify-center items-start z-low-medium min-w-[100vw] min-h-[100vh] overflow-auto py-4">
        <div className="bg-base-100 rounded-lg shadow-2xl max-w-6xl w-[90vw] h-auto overflow-auto relative flex flex-col">
          <div className="flex items-start justify-between p-6 border-b">
            <h3 className="text-2xl font-bold">Detailed View</h3>
            <button
              className="btn focus:outline:none hover:bg-base-300 transition-colors duration-200 border-0 rounded-full"
              onClick={() => closeModal(MODAL_TYPE.CHAT_DETAILS_VIEW_MODAL)}
            >
              <CloseCircleIcon size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-base-200 rounded-lg p-6 h-auto overflow-auto">
              {modalContent && Object.entries(modalContent).map(([key, value]) => (
                <div key={key} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-semibold mb-2">{key}</h4>
                  {Array.isArray(value) ? (
                    <ul className="space-y-2 ml-4">
                      {value.map((item, index) => (
                        <li key={index} className="break-words">
                          <div className="bg-base-100 p-4 rounded-lg shadow-inner break-words whitespace-pre-wrap">
                            {typeof item === 'object' && item !== null && key === 'messages' ? (
                              renderFlattenedMessage(item)
                            ) : (
                              <span className="text-base-content/80">
                                {typeof item === 'object' && item !== null ? JSON.stringify(item, null, 2) : String(item)}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-base-100 p-4 rounded-lg shadow-inner">
                      {typeof value === 'object' && value !== null ? (
                        <pre className="text-base-content/80 break-words whitespace-pre-wrap">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <pre className="text-base-content/80 break-words whitespace-pre-wrap">
                          {formatValue(String(value))}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ChatAiConfigDeatilViewModal