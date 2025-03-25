'use client';
import { MODAL_TYPE } from "@/utils/enums";
import { allowedAttributes, openModal } from "@/utils/utility";
import { CircleX, Copy } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import ChatAiConfigDeatilViewModal from "../modals/ChatAiConfigDeatilViewModal";
import { truncate, useCloseSliderOnEsc } from "./assistFile";

const ChatDetails = ({ selectedItem, setIsSliderOpen, isSliderOpen, params }) => {
  if (selectedItem) {
    selectedItem['system Prompt'] = 
      selectedItem['AiConfig']?.messages?.[0]?.role === 'developer' || 
      selectedItem['AiConfig']?.messages?.[0]?.role === 'system' 
        ? selectedItem['AiConfig']?.messages?.[0]?.content 
        : selectedItem['AiConfig']?.system || selectedItem['System Prompt'];
  }
  const variablesKeyValue = selectedItem && selectedItem['variables'] ? selectedItem['variables'] : {};
  const [modalContent, setModalContent] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const closeSliderOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsSliderOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("keydown", closeSliderOnEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useCloseSliderOnEsc(setIsSliderOpen);

  const copyToClipboard = (content) => {
    navigator.clipboard
      .writeText(JSON.stringify(content))
      .then(() => {
        toast.success(`Copied to clipboard`);
      })
      .catch((error) => {
        toast.error(`Error while copying to clipboard`);
        console.log(error);
      });
  };

  const replaceVariablesInPrompt = (prompt) => {
    return prompt.replace(/{{(.*?)}}/g, (_, variableName) => {
      const value = variablesKeyValue[variableName];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
      return `{{${variableName}}}`;
    })
  };

  const handleObjectClick = useCallback((key, displayValue) => {
    if (JSON.stringify(displayValue).length > 197) {
      setModalContent(key === 'variables' ? {"variable":displayValue} : displayValue);
      openModal(MODAL_TYPE.CHAT_DETAILS_VIEW_MODAL);
    }
  }, []);

  // Open modal if selectedItem.value matches a key
  useEffect(() => {
    if (selectedItem?.value && selectedItem?.value !== 'system Prompt') {
      const key = selectedItem.value;
      const value = selectedItem[key];
      if (value && JSON.stringify(value).length > 197) {
        handleObjectClick(key, value);
      }
    }
  }, [selectedItem, handleObjectClick]);

  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 right-0 border-l-2 bg-base-100 shadow-2xl rounded-md ${
        isSliderOpen ? "w-full md:w-1/2 lg:w-1/2 opacity-100" : "w-0"
      } overflow-y-auto bg-gradient-to-br from-base-200 to-base-100 transition-all duration-300 ease-in-out z-[9999]`}
    >
      {selectedItem && (
        <aside className="flex flex-col h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                Chat Details
              </h2>
              <button 
                onClick={() => setIsSliderOpen(false)} 
                className="btn btn-ghost btn-circle hover:bg-base-100 transition-colors duration-200"
              >
                <CircleX size={20} className="bg-base-100" />
              </button>
            </div>
            <div className="bg-base-100 rounded-md shadow-sm">
              <div className="w-full">
                <div className="w-full">
                  {/* Important attributes first */}
                  {allowedAttributes.important
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([key, displayKey]) => {
                    const value = selectedItem[key];
                    if (value === undefined) return null;

                    let displayValue = value;
                    if (key === "system Prompt" && typeof value === "string") {
                      displayValue = replaceVariablesInPrompt(value);
                      displayValue = displayValue.replace(/\n/g, '<br />');
                    }

                    return (
                      <div 
                        key={key} 
                        className={`border-b bg-base-100 transition-colors duration-150 ${
                          selectedItem?.value === key ? 'ring-2 ring-green-500 ring-opacity-75 shadow-lg' : ''
                        }`}
                      >
                        <div className="pt-4 px-4 text-sm font-semibold capitalize">
                          {displayKey}
                        </div>
                        <div className="py-4 px-4">
                          {typeof displayValue === "object" ? (
                            <div className="relative">
                              <pre 
                                className={`bg-base-200 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap border border-base-200 ${
                                  JSON.stringify(displayValue).length > 200 ? 'cursor-pointer hover:border-primary transition-colors duration-200' : ''
                                }`}
                                onClick={() => handleObjectClick(key, displayValue)}
                              >
                                {truncate(JSON.stringify(displayValue, null, 2), 210)}
                              </pre>
                              {key === "variables" && displayValue && (
                                <div
                                  className={`absolute top-2 right-2 tooltip tooltip-primary tooltip-left hover:bg-base-300 p-2 rounded-full cursor-pointer transition-colors duration-200`}
                                  onClick={(e) => copyToClipboard(displayValue)}
                                  data-tip="Copy variables"
                                >
                                  <Copy size={18} className="text-base-content" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600 break-words">
                              <div dangerouslySetInnerHTML={{ __html: displayValue?.toString() }}></div>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-base-200">
                    <div className="py-2 px-6 text-sm font-semibold text-gray-500">
                      Optional Details
                    </div>
                  </div>

                  {allowedAttributes.optional
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([key, displayKey]) => {
                      const value = selectedItem[key];
                      if (value === undefined) return null;

                      return (
                        <tr key={key} className="border-b bg-base-100 transition-colors duration-150">
                          <td className="py-4 px-6 text-sm font-semibold capitalize">
                            {displayKey}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-600 break-words">
                              {key === 'createdAt' ? new Date(value).toLocaleString() : value?.toString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
      <ChatAiConfigDeatilViewModal modalContent={modalContent} />
    </div>
  );
};

export default ChatDetails;