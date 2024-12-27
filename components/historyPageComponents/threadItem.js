import { updateContentHistory } from "@/store/action/historyAction";
import { Bot, FileClock, MessageCircleCode, Parentheses, Pencil, SquareFunction, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import CodeBlock from "../codeBlock/codeBlock";
import ToolsDataModal from "./toolsDataModal";
import EditMessageModal from "../modals/EditMessageModal";
import { truncate } from "./assistFile";

const ThreadItem = ({ index, item, threadHandler, formatDateAndTime, integrationData, params, threadRefs, searchMessageId, setSearchMessageId }) => {
  const dispatch = useDispatch();
  const [messageType, setMessageType] = useState(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  const [toolsData, setToolsData] = useState([]); // Track the selected tool call data
  const toolsDataModalRef = useRef(null);
  const [modalInput, setModalInput] = useState("");
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const modalRef = useRef(null);
  const dropupRef = useRef(null);

  useEffect(() => {
    setMessageType(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  }, [item]);

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
    if (messageType === 1) return item.content;
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
        dropupRef?.current &&
        !dropupRef?.current?.contains(event.target) &&
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

  const messageId = item.message_id;
  useEffect(() => {
    if (messageId && !threadRefs.current[messageId]) {
      threadRefs.current[messageId] = document.getElementById(`message-${messageId}`);
    }
    const messageElement = document.getElementById(`message-${searchMessageId}`);

    if (messageElement && searchMessageId) {
      messageElement.classList.add('bg-base-300', 'rounded-md');
      setTimeout(() => {
        messageElement.classList.remove('bg-base-300', 'rounded-md');
      }, 2000);
      setSearchMessageId(null);
    }
  }, [messageId, searchMessageId]);

  return (
    <div key={`item-id-${item?.id}`} id={`message-${messageId}`} ref={(el) => (threadRefs.current[messageId] = el)} className="">
      {item?.role === "tools_call" ? (
        <div className="mb-2 flex flex-col justify-center items-center">
          <h1 className="p-1">
            <span className="flex justify-center items-center gap-2 font-semibold"><Parentheses size={16} />Functions Executed Successfully</span>
          </h1>
          <div className="flex h-full gap-2 justify-center items-center flex-wrap">
            {item?.tools_call_data ?
              item?.tools_call_data?.map((toolData, index) =>
                Object.entries(toolData)?.map(([key, tool]) => (
                  <div key={index} className="bg-base-200 rounded-lg flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1 shadow-sm">
                    <div onClick={() => openViasocket(tool?.name, { flowHitId: tool?.metadata?.flowHitId })}
                      className="cursor-pointer flex items-center justify-center py-4 pl-2">
                      <div className="text-center">
                        {truncate(integrationData?.[tool.name]?.title || tool?.name, 20)}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="tooltip tooltip-top relative" data-tip="function logs">
                        <SquareFunction size={22}
                          onClick={() => openViasocket(tool.name, { flowHitId: tool?.metadata?.flowHitId })}
                          className="opacity-80 cursor-pointer" />
                      </div>
                      <div className="tooltip tooltip-top pr-2 relative" data-tip="function data">
                        <FileClock
                          size={22}
                          onClick={() => {
                            setToolsData(tool);
                            toolsDataModalRef.current?.showModal();
                          }}
                          className="opacity-80 bg-inherit cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )
              :
              Object.keys(item.function).map((funcName, index) => (
                <div key={index} className="bg-base-200 rounded-lg  flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1">
                  <div onClick={() => openViasocket(funcName, { flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId })}
                    className="cursor-pointer flex items-center justify-center py-4 pl-2">
                    <div className="font-semibold text-center">
                      {truncate(integrationData?.[funcName]?.title || funcName, 20)}
                    </div>
                  </div>

                  <div className="tooltip tooltip-top pr-2" data-tip="function logs">
                    <SquareFunction size={22}
                      onClick={() => openViasocket(funcName, { flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId })}
                      className="opacity-80 cursor-pointer" />
                  </div>

                </div>
              ))
            }
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
                        <li>
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
                          <div className="tooltip tooltip-left" data-tip="Normal Response">
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
              {item?.role === "user" && (
                <div className="flex flex-wrap">
                  {item?.urls?.map((url, index) => (
                    <div key={index} className="chat chat-end flex-grow-1">
                      <div className="">
                        <img src={url} alt="Attached" className="max-w-full max-h-16 w-auto h-auto rounded-md" loading="lazy"/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {item?.role === "assistant" && item?.image_url && (
                <div className="chat chat-end">
                  <div className="bg-base-200 text-error pr-10 chat-bubble transition-all ease-in-out duration-300">
                    <img src={item.image_url} alt="Attached" className="max-w-full max-h-96 w-auto h-auto rounded-md" loading="lazy"/>
                  </div>
                </div>
              )}
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
                {!item.image_url && getMessageToDisplay()}
              </ReactMarkdown>
              {!item.image_url && item?.role === 'assistant' && (
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
          {(item?.role === "assistant" || item.role === 'user') && item?.is_reset && <div className="flex justify-center items-center my-4">
            <p className="border-t border-base-300 w-full"></p>
            <p className="bg-error text-base-100 py-1 px-2 rounded-full mx-4 whitespace-nowrap text-sm">
              History cleared
            </p>
            <p className="border-t border-base-300 w-full"></p>
          </div>}
          {
            item?.error && (
              <div className="chat chat-end">
                <div className="bg-base-200 text-error pr-10 chat-bubble transition-all ease-in-out duration-300">
                  <span className="font-bold">Error</span>
                  <p>{item?.error}</p>
                </div>
                <div className="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
                  <Bot size={20} />
                </div>
                {item?.role === "user" && <time className="text-xs opacity-50 chat-end">{formatDateAndTime(item?.createdAt)}</time>}
              </div>
            )
          }
        </div>
      )}

      <ToolsDataModal toolsData={toolsData} handleClose={handleCloseToolsDataModal} toolsDataModalRef={toolsDataModalRef} integrationData={integrationData} />
      <EditMessageModal modalRef={modalRef} setModalInput={setModalInput} handleClose={handleClose} handleSave={handleSave} modalInput={modalInput} />
    </div>
  );
};

export default ThreadItem;
