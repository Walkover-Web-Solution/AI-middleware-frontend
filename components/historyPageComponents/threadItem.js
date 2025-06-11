import { getSingleMessage } from "@/config";
import { updateContentHistory } from "@/store/action/historyAction";
import { AlertCircle, Bot, BotMessageSquare, ChevronDown, FileClock, MessageCircleCode, Parentheses, Pencil, Plus, SquareFunction, User } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import CodeBlock from "../codeBlock/codeBlock";
import EditMessageModal from "../modals/EditMessageModal";
import { truncate } from "./assistFile";
import ToolsDataModal from "./toolsDataModal";
import { useCustomSelector } from "@/customHooks/customSelector";

const ThreadItem = ({ index, item, threadHandler, formatDateAndTime, integrationData, params, threadRefs, searchMessageId, setSearchMessageId, handleAddTestCase }) => {
  const dispatch = useDispatch();
  const [messageType, setMessageType] = useState(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  const [toolsData, setToolsData] = useState([]);
  const toolsDataModalRef = useRef(null);
  const [modalInput, setModalInput] = useState("");
   const { embedToken } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
  }));
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const modalRef = useRef(null);
  const dropupRef = useRef(null);

  useEffect(() => {
    setMessageType(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  }, [item]);

  const handleEdit = useCallback(() => {
    setModalInput(item.updated_message || item.content);
    modalRef.current?.showModal() || console.error("Modal element not found");
  }, [item]);

  const handleClose = useCallback(() => {
    setModalInput("");
    modalRef.current?.close() || console.error("Modal element not found");
  }, []);

  const handleSave = useCallback(() => {
    if (modalInput.trim() === "") {
      alert("Message cannot be empty.");
      return;
    }
    dispatch(updateContentHistory({
      id: item?.Id,
      bridge_id: params.id,
      message: modalInput,
      index
    }));
    setModalInput("");
    modalRef.current?.close() || console.error("Modal element not found");
  }, [dispatch, item.id, params.id, modalInput, index]);

  const getMessageToDisplay = useCallback(() => {
    switch (messageType) {
      case 0: return item.chatbot_message;
      case 1: return item.content;
      case 2: return item.updated_message;
      default: return "";
    }
  }, [messageType, item]);

  const selectMessageType = useCallback((type) => {
    setMessageType(type);
    setIsDropupOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropupRef.current && !dropupRef.current.contains(event.target) && !event.target.closest('.bot-icon')) {
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

  const handleCloseToolsDataModal = useCallback(() => {
    setToolsData([]);
    toolsDataModalRef.current?.close();
  }, []);

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
  }, [messageId, searchMessageId, threadRefs, setSearchMessageId]);

  const renderToolData = (toolData, index) => (
    Object.entries(toolData).map(([key, tool]) => (
      <div key={index} className="bg-base-200 rounded-lg flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1 shadow-sm">
        <div onClick={() => openViasocket(tool?.id, { flowHitId: tool?.metadata?.flowHitId, embedToken,  meta: {
                                type: 'tool',
                                bridge_id: params?.id,
                            } })}
          className="cursor-pointer flex items-center justify-center py-4 pl-2">
          <div className="text-center">
            {truncate(integrationData?.[tool.name]?.title || tool?.name, 20)}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="tooltip tooltip-top relative" data-tip="function logs">
            <SquareFunction size={22}
              onClick={() => openViasocket(tool.id, { flowHitId: tool?.metadata?.flowHitId, embedToken,  meta: {
                type: 'tool',
                bridge_id: params?.id,
            } })}
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
  );

  const renderFunctionData = (funcName, index) => (
    <div key={index} className="bg-base-200 rounded-lg flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1">
      <div onClick={() => openViasocket(funcName, { flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId, embedToken,  meta: {
                                type: 'tool',
                                bridge_id: params?.id,
                            } })}
        className="cursor-pointer flex items-center justify-center py-4 pl-2">
        <div className="font-semibold text-center">
          {truncate(integrationData?.[funcName]?.title || funcName, 20)}
        </div>
      </div>
      <div className="tooltip tooltip-top pr-2" data-tip="function logs">
        <SquareFunction size={22}
          onClick={() => openViasocket(funcName, { flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId, embedToken,  meta: {
            type: 'tool',
            bridge_id: params?.id,
        } })}
          className="opacity-80 cursor-pointer" />
      </div>
    </div>
  );

  const handleAskAi = async (item) => {
    const aiconfig = handleAddTestCase(item, index, true)
    let variables = {aiconfig, response: item?.chatbot_message ? item?.chatbot_message : item?.content}
    try {
      const systemPromptResponse = await getSingleMessage({ bridge_id: params.id, message_id: item.createdAt });
      variables = { "System Prompt": systemPromptResponse, ...variables }
    } catch (error) {
      console.error("Failed to fetch single message:", error);
    }
    window.SendDataToChatbot({
      "parentId": '',
      "bridgeName": "history_page_chabot",
      "threadId": item?.id,
      variables,
      version_id: 'null',
      hideCloseButton : 'false'
    });
    setTimeout(() => window.openChatbot(), 100)
  }
  const handleUserButtonClick = (value) => {
    threadHandler(item.thread_id, item, value)
  }

  return (
    <div key={`item-id-${item?.id}`} id={`message-${messageId}`} ref={(el) => (threadRefs.current[messageId] = el)} className="">
      {item?.role === "tools_call" ? (
        <div className="mb-2 flex flex-col justify-center items-center show-on-hover">
          <h1 className="p-1">
            <span className="flex justify-center items-center gap-2 font-semibold"><Parentheses size={16} />Functions Executed Successfully</span>
          </h1>
          <div className="flex h-full gap-2 justify-center items-center flex-wrap">
            {item?.tools_call_data ? item.tools_call_data.map(renderToolData) : Object.keys(item.function).map(renderFunctionData)}
            <button
              className="btn btn-xs see-on-hover"
              onClick={() => handleAddTestCase(item, index)}
            >
              <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                <Plus className="h-3 w-3" />
                <span>Test Case</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="show-on-hover" >
          <div className={`chat ${item.role === "assistant" ? "chat-start" : "chat-end"}`}>
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center">
                <div className="relative rounded-full bg-base-300 flex justify-center items-center">
                  {item.role === "assistant" ? (
                    <div>
                      <Bot
                        className=" cursor-pointer bot-icon"
                        size={20}
                        onClick={() => setIsDropupOpen(!isDropupOpen)}
                      /></div>
                  ) : (
                    <User size={20} />
                  )}
                </div>
                {isDropupOpen && item.role === "assistant" && (
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
              {messageType === 2 && <p className="text-xs opacity-50">Edited</p>}
            </div>
            
            <div  className={`flex justify-start ${item.role === "user" ? "flex-row-reverse" : ""} items-center gap-1 `}
  style={{ overflowWrap: "anywhere" }}>
              <div className={`${item.role === "assistant" ? "bg-base-200  text-base-content pr-10" : "chat-bubble-primary "} chat-bubble transition-all ease-in-out duration-300`}>
                {item?.role === "assistant" && item?.image_url && (
                  <div className="chat chat-start">
                    <div className="bg-base-200 text-error pr-10 chat-bubble transition-all ease-in-out duration-300">
                      <Image
                        src={item.image_url}
                        alt="Attached"
                        width={300} // Adjust width as needed
                        height={300} // Adjust height as needed
                        className="max-w-full max-h-96 w-auto h-auto rounded-md"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
                {item?.role === "user" && (
                  <div className="flex flex-wrap">
                    {item?.urls?.map((url, index) => (
                      <div key={index} className="chat chat-end flex-grow-1">
                        <div className="">
                          <Image
                            src={url}
                            alt="Attached"
                            width={64} // Adjust width as needed
                            height={64} // Adjust height as needed
                            className="max-w-full max-h-16 w-auto h-auto rounded-md"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {item?.firstAttemptError && item?.role === "assistant" && (
                  <div className="collapse bg-base-200/50  p-0">
                    <input
                      type="checkbox"
                      className="peer"
                      // id={`errorCollapse-${item.id || index}`}
                    />
                    <label
                      htmlFor={`errorCollapse-${item.id || index}`}
                      className="collapse-title text-sm font-medium cursor-pointer flex items-center justify-between  hover:bg-base-300/50 transition-colors p-0"
                    >
                      <span className="flex items-center gap-4">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        <span className="font-light">Retry Attempt with {item?.model}</span>
                        <ChevronDown className="w-4 h-4 transform peer-checked:rotate-180 transition-transform" />
                      </span>
                     
                    </label>
                    <div className="collapse-content bg-base-100/50 rounded-b-md text-sm  border-t border-base-300">
                      <div className="text-error font-mono break-words bg-base-200/50 rounded-md p-2">
                        <pre className="whitespace-pre-wrap">{item?.firstAttemptError}</pre>
                      </div>
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
                  <div className="flex gap-2 tooltip absolute top-2 right-2 text-sm cursor-pointer" data-tip="Edit response">
                    <Pencil
                      size={16}
                      onClick={handleEdit}
                    />
                  </div>
                )}
                {item?.role === 'assistant' && <div className=" absolute bottom-[-30px] left-0 flex gap-2">
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleAddTestCase(item, index)}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <Plus className="h-3 w-3" />
                      <span>Test Case</span>
                    </div>
                  </button>
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleAskAi(item)}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <BotMessageSquare className="h-3 w-3" />
                      <span>Ask AI</span>
                    </div>
                  </button>
                </div>}
              </div>
            </div>
            {item?.role === "user" && <div className="flex flex-row-reverse gap-2 m-1 overflow-wrap: anywhere items-center">
                <time className="text-xs opacity-50 chat-end">
                  {formatDateAndTime(item.createdAt)}
                </time> 
                <div className="flex gap-1">
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleUserButtonClick("AiConfig")}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <SquareFunction className="h-3 w-3" />
                      <span>Ai config</span>
                    </div>
                  </button>
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleUserButtonClick("variables")}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <Parentheses className="h-3 w-3" />
                      <span>Variables</span>
                    </div>
                  </button>
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleUserButtonClick("system Prompt")}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <FileClock className="h-3 w-3" />
                      <span>System Prompt</span>
                    </div>
                  </button>
                  <button
                    className="btn btn-xs see-on-hover"
                    onClick={() => handleUserButtonClick("more")}
                  >
                    <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                      <Plus className="h-3 w-3" />
                      <span>More...</span>
                    </div>
                  </button>
                </div>
              </div>}
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
              <div className="chat chat-start break-all break-words">
                <div>
                  <div className="flex  flex-row-reverse items-end justify-end gap-1">
                    <div className="bg-base-200 text-error pr-10 chat-bubble transition-all ease-in-out duration-300">
                      <span className="font-bold">Error</span>
                      <p>{item?.error}</p>
                    </div>
                    <div className="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center"><Bot size={20} /></div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      )}

      <ToolsDataModal toolsData={toolsData} handleClose={handleCloseToolsDataModal} toolsDataModalRef={toolsDataModalRef} integrationData={integrationData} />
      <EditMessageModal modalRef={modalRef} setModalInput={setModalInput} handleClose={handleClose} handleSave={handleSave} modalInput={modalInput} />
    </div >
  );
};

export default ThreadItem;
