import { Bot, MessageCircleCode, Pencil, User, Info, FileClock, SquareFunction, Parentheses } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import CodeBlock from "../codeBlock/codeBlock";
import { updateContentHistory } from "@/store/action/historyAction";
import ToolsDataModal from "./toolsDataModal";


const ThreadItem = ({ index, item, threadHandler, formatDateAndTime, integrationData, params }) => {
  const dispatch = useDispatch();
  const [messageType, setMessageType] = useState(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  const [showNormalMessage, setShowNormalMessage] = useState(false);
  const [toolsData, setToolsData] = useState([]); // Track the selected tool call data
  const toolsDataModalRef = useRef(null);
  const [modalInput, setModalInput] = useState("");
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const modalRef = useRef(null);
  const dropupRef = useRef(null);

  useEffect(() => {
    setMessageType(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  }, [item]);


  const handleToggle = () => {
    setShowNormalMessage((prevState) => !prevState);
  };

  const handleEdit = () => {
    setModalInput(item.updated_message || item.content);
    if (modalRef.current) {
      modalRef.current.showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  const handleClose = () => {
    setModalInput("");
    if (modalRef.current) {
      modalRef.current.close();
    } else {
      console.error("Modal element not found");
    }
  };

  const handleSave = () => {
    if (modalInput.trim() === "") {
      alert("Message cannot be empty.");
      return;
    }
    dispatch(updateContentHistory({
      id: item.id,
      bridge_id: params.id,
      message: modalInput,
      index
    }));
    setModalInput("");

    if (modalRef.current) {
      modalRef.current.close();
    } else {
      console.error("Modal element not found");
    }
  };

  const getMessageToDisplay = () => {
    if (messageType === 0) return item.chatbot_message;
    if (messageType===1)return  item.content;
    if (messageType === 2) return item.updated_message;

  };

  const selectMessageType = (type) => {
    setMessageType(type);
    setIsDropupOpen(false); // Close the dropup after selection
  };

  // Close dropup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target) &&
        !event.target.closest('.bot-icon')
      ) {
        setIsDropupOpen(false);
      }
    };

    if (isDropupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropupOpen]);

  const handleCloseToolsDataModal = () => {
    setToolsData([]);
    if (toolsDataModalRef.current) {
      toolsDataModalRef.current.close();
    }
  };
  // Truncate function
function truncate(string, maxLength) {
  if (string.length > maxLength) {
      return string.substring(0, maxLength - 3) + '...'; 
  }
  return string;
}

  return (
    <div key={`item-id-${item?.id}`} >
      {item?.role === "tools_call" ? (
        <div className="mb-2">
          <h1 className="mt-4 auto p-2 w-1/4 mb-2 opacity-80 rounded-md flex items-center gap-2">
            <span><Parentheses size={16} /></span> Functions Executed Successfully
          </h1>
          <div className="w-full flex overflow-x-auto h-full gap-1 justify-start items-center whitespace-nowrap">
            {Object.entries(item.tools_call_data[0] || {}).map(([key, tool], index) => (
              <div key={index} className="bg-base-200 rounded-lg w-1/7  flex gap-4 duration-200 items-center justify-between hover:bg-base-300">
                <div onClick={() => openViasocket(tool.name, { flowHitId: JSON.parse(item.function[tool.name])?.metadata?.flowHitId })}
                  className="cursor-pointer flex items-center justify-center py-4 pl-2">
                  <div className="text-xs font-bold text-center">
                    {truncate(integrationData?.[tool.name]?.title || tool.name, 20)}
                  </div>
                </div>
                <div className="flex gap-3">

                  <div className="tooltip tooltip-left  relative" data-tip="function logs">
                    <SquareFunction size={18}
                      onClick={() => openViasocket(tool.name, { flowHitId: JSON.parse(item.function[tool.name])?.metadata?.flowHitId })}
                      className="opacity-80 cursor-pointer" />
                  </div>
                  <div className="tooltip tooltip-left  pr-2 relative" data-tip="function data">
                    <FileClock
                      size={18}
                      onClick={() => {
                        setToolsData(tool?.tool_call);
                        toolsDataModalRef.current.showModal();
                      }}
                      className="opacity-80 bg-inherit cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className={`chat ${item.role === "user" ? "chat-start" : "chat-end"}`}>
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center">
                <div className="relative rounded-full bg-base-300 flex justify-center items-center">
                  {item.role === "user" ? (
                    <User size={20} />
                  ) : (
                    <div>
                      <Bot
                        className=" cursor-pointer bot-icon"
                        size={20}
                        onClick={() => setIsDropupOpen(!isDropupOpen)}
                      /></div>
                  )}
                </div>
                {isDropupOpen && item.role !== "user" && (
                  <div
                    ref={dropupRef}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-inherit rounded-md shadow-lg "
                    style={{ zIndex: 9 }}
                  >
                    <ul className="flex justify-center flex-col items-center gap-2">
                      {item.chatbot_message && (
                        <li className={`${item.chatbot_message ? "" : "hidden"}`}>
                          <button
                            className={`px-2 py-1 ${messageType === 0 ? "bg-primary text-white rounded-md" : ""
                              }`}
                            onClick={() => selectMessageType(0)}
                          >
                            <div className="tooltip tooltip-left" data-tip="Chatbot Response">
                              <Bot className="" size={16} />
                            </div>
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className={`px-2 py-1 ${messageType === 1 ? "bg-primary text-white rounded-md" : ""
                            }`}
                          onClick={() => selectMessageType(1)}
                        >
                          <div className="tooltip tooltip-left" data-tip="Normal Reponse">
                            <MessageCircleCode className="" size={16} />
                          </div>
                        </button>
                      </li>
                      {item.updated_message && (
                        <li>
                          <button
                            className={`px-2 py-1 ${messageType === 2 ? "bg-primary text-white rounded-md" : ""
                              }`}
                            onClick={() => selectMessageType(2)}
                          >
                            <div className="tooltip tooltip-left" data-tip="Updated Message">
                              <Pencil className="" size={16} />
                            </div>
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="chat-header flex gap-4 items-center mb-1">
              {messageType === 2 ? <p className="text-xs opacity-50">Edited</p> : ""}
            </div>
            <div className={`${item.role === "user" ? "cursor-pointer chat-bubble-primary " : "bg-base-200  text-base-content pr-10"} chat-bubble transition-all ease-in-out duration-300`} onClick={() => threadHandler(item.thread_id, item)}>
              <ReactMarkdown components={{
                code: ({ node, inline, className, children, ...props }) => (
                  <CodeBlock
                    inline={inline}
                    className={className}
                    {...props}
                  >
                    {children}
                  </CodeBlock>
                )
              }}>
                {getMessageToDisplay()}
              </ReactMarkdown>
              {item?.role === 'assistant' && (
                <div className="tooltip absolute top-2  right-2 text-sm cursor-pointer" data-tip="Edit response">
                  <Pencil
                    size={16}
                    onClick={handleEdit}
                  />
                </div>
              )}
            </div>
            {item?.role === "assistant" && <time className="text-xs opacity-50 chat-end">{formatDateAndTime(item.createdAt)}</time>}
          </div>
          {item.role == 'assistant' && item.is_reset && <div class="flex justify-center items-center my-4">
            <p class="border-t border-base-300 w-full"></p>
            <p class="bg-error text-base-100 py-2 px-4 rounded-md mx-4 whitespace-nowrap">
              History cleared
            </p>
            <p class="border-t border-base-300 w-full"></p>
          </div>}
          {
            item?.error && (
              <div className="chat chat-end">
                <div className="flex-1 chat-bubble bg-base-200 text-error mb-3">
                  <span className="font-bold">Error</span>
                  <p>{item.error}</p>
                </div>
                <div className="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
                  <Bot size={20} />
                </div>
              </div>
            )
          }

        </div>
      )}

      <ToolsDataModal toolsData={toolsData} handleClose={handleCloseToolsDataModal} toolsDataModalRef={toolsDataModalRef} integrationData={integrationData} />

      {/* Modal */}
      <dialog className="modal modal-bottom sm:modal-middle" ref={modalRef}>
        <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Enter your input:</span>
            </label>
            <textarea
              type="text"
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
    </div>
  );
};

export default ThreadItem;
