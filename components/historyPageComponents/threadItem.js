import { getSingleMessage } from "@/config";
import { CircleAlertIcon, BotIcon, ChevronDownIcon, FileClockIcon, ParenthesesIcon, PencilIcon, AddIcon, SquareFunctionIcon, UserIcon, CodeMessageIcon, BotMessageIcon, FileTextIcon, AlertIcon } from "@/components/Icons";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../codeBlock/codeBlock";
import { truncate } from "./assistFile";
import ToolsDataModal from "./toolsDataModal";
import { useCustomSelector } from "@/customHooks/customSelector";
import { openModal } from "@/utils/utility";
import { MODAL_TYPE, FINISH_REASON_DESCRIPTIONS } from "@/utils/enums";
import { PdfIcon } from "@/icons/pdfIcon";
import { ExternalLink } from "lucide-react";
import { original } from "@reduxjs/toolkit";

// Helper function to normalize image data with enhanced fallback
const normalizeImageUrls = (imageData) => {
  if (!imageData) return [];

  // If it's already an array, return filtered valid images
  if (Array.isArray(imageData)) {
    return imageData.filter(img => {
      if (!img) return false;
      return img.permanent_url;
    });
  }
  return [];
};

// Enhanced fallback component with better UX
const ImageFallback = ({ type = 'large', url = '', error = 'failed_to_load' }) => {
  const isLarge = type === 'large';
  const containerSize = isLarge ? 'w-[180px] h-[180px]' : 'w-16 h-16';

  const getErrorMessage = () => {
    switch (error) {
      case 'failed_to_load':
        return 'Failed to Load image';
      default:
        return 'Preview unavailable';
    }
  };

  const getIcon = () => {
    return (
      <FileTextIcon />
    );
  };

  return (
    <div className={`flex items-center justify-center bg-base-200/50 border border-base-300/50 rounded-lg ${containerSize} group hover:bg-base-200/70 transition-colors duration-200`}>
      <div className="text-center p-3">
        <div className="mb-2 flex justify-center">
          {getIcon()}
        </div>
        {isLarge && (
          <>
            <p className="text-sm text-base-content/60 font-medium mb-2">
              {getErrorMessage()}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Enhanced image component with loading states
const EnhancedImage = ({ src, alt, width, height, className, type = 'large', onError, onLoad }) => {
  const [imageState, setImageState] = useState('loading');
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setImageState('loaded');
    if (onLoad) onLoad();
  };

  const handleImageError = (e) => {
    setImageState('error');
    setHasError(true);
    if (onError) onError(e);
  };

  if (hasError) {
    return <ImageFallback type={type} url={src} error="failed_to_load" />;
  }

  return (
    <div className="relative group">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-200 ${imageState === 'loading' ? 'opacity-0' : 'opacity-100'} hover:opacity-90 rounded-lg`}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {imageState === 'loaded' && type === 'large' && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => window.open(src, '_blank')}
            className="btn btn-xs btn-circle btn-ghost bg-base-100/80 hover:bg-base-100"
            title="Open in new tab"
          >
            <ExternalLink size={14} className="text-base-primary" />
          </button>
        </div>
      )}
    </div>
  );
};

const ThreadItem = ({ index, item, threadHandler, formatDateAndTime, integrationData, params, threadRefs, searchMessageId, setSearchMessageId, handleAddTestCase, setModalInput }) => {
  const [messageType, setMessageType] = useState(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  const [toolsData, setToolsData] = useState([]);
  const toolsDataModalRef = useRef(null);
  const { embedToken } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
  }));
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const dropupRef = useRef(null);

  useEffect(() => {
    setMessageType(item?.updated_message ? 2 : item?.chatbot_message ? 0 : 1);
  }, [item]);

  const handleEdit = () => {
    setModalInput({
      content: item.updated_message || item.content,
      originalContent: item.content,
      index,
      Id: item.Id
    });
    openModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  };

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
        <div onClick={() => openViasocket(tool?.id, {
          flowHitId: tool?.metadata?.flowHitId, embedToken, meta: {
            type: 'tool',
            bridge_id: params?.id,
          }
        })}
          className="cursor-pointer flex items-center justify-center py-4 pl-2">
          <div className="text-center">
            {truncate(integrationData?.[tool.name]?.title || tool?.name, 20)}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="tooltip tooltip-top relative text-base-content" data-tip="function logs">
            <SquareFunctionIcon size={22}
              onClick={() => openViasocket(tool.id, {
                flowHitId: tool?.metadata?.flowHitId, embedToken, meta: {
                  type: 'tool',
                  bridge_id: params?.id,
                }
              })}
              className="opacity-80 cursor-pointer" />
          </div>
          <div className="tooltip tooltip-top pr-2 relative text-base-content" data-tip="function data">
            <FileClockIcon
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
      <div onClick={() => openViasocket(funcName, {
        flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId, embedToken, meta: {
          type: 'tool',
          bridge_id: params?.id,
        }
      })}
        className="cursor-pointer flex items-center justify-center py-4 pl-2">
        <div className="font-semibold text-center">
          {truncate(integrationData?.[funcName]?.title || funcName, 20)}
        </div>
      </div>
      <div className="tooltip tooltip-top pr-2 relative text-base-content" data-tip="function logs">
        <SquareFunctionIcon size={22}
          onClick={() => openViasocket(funcName, {
            flowHitId: JSON?.parse(item.function[funcName] || '{}')?.metadata?.flowHitId, embedToken, meta: {
              type: 'tool',
              bridge_id: params?.id,
            }
          })}
          className="opacity-80 cursor-pointer" />
      </div>
    </div>
  );

  const handleAskAi = async (item) => {
    const aiconfig = handleAddTestCase(item, index, true)
    let variables = { aiconfig, response: item?.chatbot_message ? item?.chatbot_message : item?.content }
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
      hideCloseButton: 'false'
    });
    setTimeout(() => window.openChatbot(), 100)
  }

  const handleUserButtonClick = (value) => {
    threadHandler(item.thread_id, item, value)
  }

  // Render assistant images with enhanced fallback
  const renderAssistantImages = () => {
    const imageUrls = normalizeImageUrls(item?.image_urls || item?.image_url);

    if (imageUrls.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          {imageUrls.map((attachment, index) => {
            const imageUrl = attachment.permanent_url;

            if (!imageUrl) {
              return (
                <div key={`assistant-img-fallback-${index}`} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                  <ImageFallback type="large" error="failed_to_load" />
                </div>
              );
            }

            return (
              <div key={`assistant-img-${index}`} className="relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                <EnhancedImage
                  src={imageUrl}
                  alt={`Assistant attachment ${index + 1}`}
                  width={300}
                  height={300}
                  className="max-w-full max-h-96 w-auto h-auto object-cover"
                  type="large"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div key={`item-id-${item?.id}`} id={`message-${messageId}`} ref={(el) => (threadRefs.current[messageId] = el)} className="">
      {item?.role === "tools_call" ? (
        <div className="mb-2 flex flex-col justify-center items-center show-on-hover">
          <h1 className="p-1">
            <span className="flex justify-center items-center gap-2 font-semibold"><ParenthesesIcon size={16} />Functions Executed Successfully</span>
          </h1>
          <div className="flex h-full gap-2 justify-center items-center flex-wrap">
            {item?.tools_call_data ? item.tools_call_data.map(renderToolData) : Object.keys(item.function).map(renderFunctionData)}
            <button
              className="btn btn-xs see-on-hover"
              onClick={() => handleAddTestCase(item, index)}
            >
              <div className="flex items-center gap-1 text-xs font-medium px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                <AddIcon className="h-3 w-3" />
                <span>Test Case</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="show-on-hover" >
          <div className={`chat ${item.role === "assistant" ? "chat-start" : "chat-end"}`}>
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center hover:bg-base-300/80 transition-colors mb-7">
                <div className="relative rounded-full bg-base-300 flex justify-center items-center">
                  {item.role === "assistant" ? (
                    <div>
                      <BotIcon
                        className=" cursor-pointer bot-icon text-base-content"
                        size={20}
                        onClick={() => setIsDropupOpen(!isDropupOpen)}
                      /></div>
                  ) : (
                    <UserIcon size={20} className="text-base-content" />
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
                            className={`px-2 py-1 ${messageType === 0 ? "bg-primary text-base-content rounded-md" : ""
                              }`}
                            onClick={() => selectMessageType(0)}
                          >
                            <div className="tooltip tooltip-right" data-tip="Chatbot Response">
                              <BotIcon className="text-base-100" size={16} />
                            </div>
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className={`px-2 py-1 ${messageType === 1 ? "bg-primary text-base-content rounded-md" : ""
                            }`}
                          onClick={() => selectMessageType(1)}
                        >
                          <div className="tooltip tooltip-right" data-tip="Normal Response">
                            <CodeMessageIcon className="text-base-100" size={16} />
                          </div>
                        </button>
                      </li>
                      {item.updated_message && (
                        <li>
                          <button
                            className={`px-2 py-1 ${messageType === 2 ? "bg-primary text-text-base-content rounded-md" : ""
                              }`}
                            onClick={() => selectMessageType(2)}
                          >
                            <div className="tooltip tooltip-right" data-tip="Updated Message">
                              <PencilIcon className="text-base-100" size={16} />
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
              {messageType === 2 && <p className="text-xs opacity-50 badge badge-sm badge-outline">Edited</p>}
            </div>

            <div
              className={`flex justify-start ${item.role === "user" ? "flex-row-reverse" : ""} items-center gap-1`}
              style={{
                width: "-webkit-fill-available",
              }}
            >
              <div
                className={`${item.role === "assistant" ? "bg-base-200 text-base-content pr-10 mb-7" : "chat-bubble-primary"}  chat-bubble transition-all ease-in-out duration-300 relative group break-words`}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-line",
                }}
              >
                {/* Render assistant images with enhanced fallback */}
                {item?.role === "assistant" && renderAssistantImages()}

                {/* Render user attachments with enhanced UI */}
                {item?.role === "user" && item?.urls?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {item.urls.map((url, index) => {
                        if (!url) {
                          return (
                            <div key={`user-attachment-empty-${index}`}>
                              <ImageFallback type="small" error="no_url" />
                            </div>
                          );
                        }

                        const isPdf = url.endsWith(".pdf");
                        return (
                          <div key={`user-attachment-${index}`} className="pr-4">
                            {isPdf ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 group"
                              >
                                <PdfIcon height={20} width={20} />
                                <span className="text-sm font-medium max-w-[5rem] truncate text-primary">
                                  {truncate(url.split('/').pop() || 'PDF', 20)}
                                </span>
                                <ExternalLink className="text-base-conten" size={14} />
                              </a>
                            ) : (
                              <EnhancedImage
                                src={url}
                                alt={`User attachment ${index + 1}`}
                                width={64}
                                height={64}
                                className="max-w-full max-h-16 w-auto h-auto object-cover"
                                type="small"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* First attempt error section */}
                {item?.firstAttemptError && item?.role === "assistant" && (
                  <div className="collapse bg-base-200/50 p-0 mb-4 border border-base-300/50 rounded-lg">
                    <input
                      type="checkbox"
                      className="peer"
                      id={`errorCollapse-${item.id || index}`}
                    />
                    <label
                      htmlFor={`errorCollapse-${item.id || index}`}
                      className="collapse-title text-sm font-medium cursor-pointer flex items-center justify-between hover:bg-base-300/50 transition-colors p-3"
                    >
                      <span className="flex items-center gap-3">
                        <CircleAlertIcon className="w-4 h-4 text-warning" />
                        <span className="font-medium">Retry Attempt with {item?.fallback_model}</span>
                      </span>
                      <ChevronDownIcon className="w-4 h-4 transform peer-checked:rotate-180 transition-transform" />
                    </label>
                    <div className="collapse-content bg-base-100/50 rounded-b-lg text-sm border-t border-base-300/50">
                      <div className="text-error font-mono break-words bg-error/10 rounded-md p-3 m-3">
                        <pre className="whitespace-pre-wrap text-xs">{item?.firstAttemptError}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Finish reason alert section */}
                {item?.role === "assistant" && item?.finish_reason &&
                  item.finish_reason !== "completed" && item.finish_reason !== "no_reason" && (
                    <div className="bg-base-200/30 border border-warning/20 rounded-md mb-3">
                      <div className="flex items-center justify-between px-3 py-2 hover:bg-base-300/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <AlertIcon className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                          <span className="text-xs font-medium text-base-content/80 leading-tight">
                            {FINISH_REASON_DESCRIPTIONS[item.finish_reason] || FINISH_REASON_DESCRIPTIONS["other"]}
                          </span>
                        </div>
                        <a
                          href="https://gtwy.ai/blogs/finish-reasons?source=single"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-warning/70 hover:text-warning transition-colors flex-shrink-0 ml-2"
                          title="More details"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                {/* Message content */}
                <ReactMarkdown components={{
                  code: ({ node, inline, className, children, ...props }) => (
                    <CodeBlock
                      className={className}
                      {...props}
                    >
                      {children}
                    </CodeBlock>
                  )
                }}>
                  {getMessageToDisplay()}
                </ReactMarkdown>

                {/* Edit button for assistant messages */}
                {item?.role === 'assistant' && item?.image_urls.length === 0 && !item?.fromRTLayer && (

                  <div className="tooltip absolute top-2 right-2 text-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" data-tip="Edit response">
                    <button
                      className="btn btn-xs btn-circle btn-ghost hover:btn-primary text-base-content"
                      onClick={handleEdit}
                    >
                      <PencilIcon
                        size={14}
                      />
                    </button>
                  </div>
                )}

                {/* Action buttons for assistant messages */}
                {item?.role === 'assistant' && (
                  <div className="absolute bottom-[-35px] left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="btn btn-xs btn-outline hover:btn-primary see-on-hover"
                      onClick={() => handleAddTestCase(item, index)}
                    >
                      <AddIcon className="h-3 w-3" />
                      <span>Test Case</span>
                    </button>
                    <button
                      className="btn btn-xs btn-outline hover:btn-primary see-on-hover"
                      onClick={() => handleAskAi(item)}
                    >
                      <BotMessageIcon className="h-3 w-3" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* User message footer with timestamp and actions */}
            {item?.role === "user" && (
              <div className="flex flex-row-reverse gap-2 m-1 overflow-wrap: anywhere items-center">
                <time className="text-xs opacity-50 chat-end">
                  {formatDateAndTime(item.createdAt)}
                </time>
                <div className="flex gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <button
                    className="btn btn-xs hover:btn-primary see-on-hover"
                    onClick={() => handleUserButtonClick("AiConfig")}
                  >
                    <SquareFunctionIcon className="h-3 w-3" />
                    <span>AI Config</span>
                  </button>
                  <button
                    className="btn btn-xs hover:btn-primary see-on-hover"
                    onClick={() => handleUserButtonClick("variables")}
                  >
                    <ParenthesesIcon className="h-3 w-3" />
                    <span>Variables</span>
                  </button>
                  <button
                    className="btn btn-xs  hover:btn-primary see-on-hover"
                    onClick={() => handleUserButtonClick("system Prompt")}
                  >
                    <FileClockIcon className="h-3 w-3" />
                    <span>System Prompt</span>
                  </button>
                  <button
                    className="btn btn-xs hover:btn-primary see-on-hover"
                    onClick={() => handleUserButtonClick("more")}
                  >
                    <AddIcon className="h-3 w-3" />
                    <span>More...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History cleared indicator */}
          {(item?.role === "assistant" || item.role === 'user') && item?.is_reset && (
            <div className="flex justify-center items-center my-6">
              <div className="divider divider-error">
                <span className="badge badge-error badge-sm">History cleared</span>
              </div>
            </div>
          )}

          {/* Error message display */}
          {item?.error && (
            <div className="chat chat-start break-all break-words">
              <div>
                <div className="flex flex-row-reverse items-end justify-end gap-1">
                  <div className="bg-error/10 text-error border border-error/20 pr-10 chat-bubble transition-all ease-in-out duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleAlertIcon className="w-4 h-4" />
                      <span className="font-bold">Error</span>
                    </div>
                    <p className="text-sm">{item?.error}</p>
                  </div>
                  <div className="w-100 p-2 rounded-full bg-error/20 flex justify-center items-center">
                    <BotIcon className="text-base-content" size={18} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ToolsDataModal toolsData={toolsData} handleClose={handleCloseToolsDataModal} toolsDataModalRef={toolsDataModalRef} integrationData={integrationData} />
    </div >
  );
};

export default ThreadItem;