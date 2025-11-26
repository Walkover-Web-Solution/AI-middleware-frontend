import { getSingleMessage } from "@/config";
import { CircleAlertIcon, BotIcon, ChevronDownIcon, FileClockIcon, ParenthesesIcon, PencilIcon, AddIcon, SquareFunctionIcon, UserIcon, CodeMessageIcon, BotMessageIcon, FileTextIcon, AlertIcon } from "@/components/Icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../codeBlock/codeBlock";
import { truncate } from "./assistFile";
import ToolsDataModal from "./toolsDataModal";
import { useCustomSelector } from "@/customHooks/customSelector";
import { formatRelativeTime, openModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
import { PdfIcon } from "@/icons/pdfIcon";
import { ExternalLink} from "lucide-react";
import { GenericSlider, useSlider } from "@/utils/sliderUtility";

// Helper function to normalize attachment data with enhanced fallback
const normalizeImageUrls = (imageData, source = "assistant") => {
  if (!Array.isArray(imageData)) return [];

  return imageData.reduce((acc, attachment) => {
    if (!attachment) return acc;
    const resolvedUrl = attachment.permanent_url || attachment.url;
    if (!resolvedUrl) return acc;

    acc.push({
      ...attachment,
      resolvedUrl,
      normalizedType: attachment?.type,
      source,
    });
    return acc;
  }, []);
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
            className="btn btn-sm btn-circle btn-ghost bg-base-100/80 hover:bg-base-100"
            title="Open in new tab"
          >
            <ExternalLink size={14} className="text-base-primary" />
          </button>
        </div>
      )}
    </div>
  );
};

const ThreadItem = ({ index, item, thread, threadHandler, formatDateAndTime, integrationData, params, threadRefs, searchMessageId, setSearchMessageId, handleAddTestCase, setModalInput }) => {
  // Determine message type based on new data structure
  const getInitialMessageType = () => {
    // Prioritize in order of importance
    if (item?.llm_message) return 'llm_message';
    if (item?.user) return 'user';
    if (item?.updated_llm_message) return 'updated_llm_message';
    if (item?.chatbot_message) return 'chatbot_message';
    if (item?.error) return 'error';
    return 'llm_message'; // Default fallback
  };
  
  const [messageType, setMessageType] = useState(getInitialMessageType());
  const [toolsData, setToolsData] = useState([]);
  const toolsDataModalRef = useRef(null);
  const { embedToken, knowledgeBaseData, isEmbedUser, finishReasonDescription } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id] || [],
    isEmbedUser: state?.appInfoReducer?.embedUserDetails?.isEmbedUser,
    finishReasonDescription: state?.flowDataReducer?.flowData?.finishReasonsData || [],
  }));
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const { sliderState, openSlider, closeSlider } = useSlider();
  const dropupRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMessageType(getInitialMessageType());
  }, [item]);

  // Determine the role based on the current messageType
  const getMessageRole = () => {
    if (item?.tools_call_data && item.tools_call_data.length > 0) return 'tools_call';
    if (item?.error && messageType === 'error') return 'error';
    
    // Role is determined by what messageType is currently selected
    if (item.user === 'user') return 'user';
    
    // All other types (llm_message, chatbot_message, updated_llm_message) are assistant
    return 'assistant';
  };

  // Check if this is the last message of the same role (assistant, user, or tools_call)
  const isLastMessage = () => {
    const currentRole = getMessageRole();
    if (!currentRole || currentRole === 'unknown') return false;
    
    // For simplicity, just return true for now since role detection is now dynamic
    return true;
  };

  const handleEdit = () => {
    setModalInput({
      content: item.updated_llm_message || item.llm_message || item.chatbot_message || item.user,
      originalContent: item.llm_message || item.user,
      index,
      Id: item.id || item.Id
    });
    openModal(MODAL_TYPE.EDIT_MESSAGE_MODAL);
  };

  const getMessageToDisplay = useCallback(() => {
    switch (messageType) {
      case 'user': return item.user || "";
      case 'llm_message': return item.llm_message || "";
      case 'chatbot_message': return item.chatbot_message || "";
      case 'updated_llm_message': return item.updated_llm_message || "";
      case 'error': return item.error || "";
      // Backward compatibility with numeric types
      case 0: return item.chatbot_message || "";
      case 1: return item.llm_message || item.user || "";
      case 2: return item.updated_llm_message || "";
      default: return item.llm_message || item.user || "";
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

  const handleToolPrimaryClick = useCallback(async (event, tool) => {
    // Check if this is a knowledge database tool
    const isKnowledgeDbTool = tool?.name === 'get_knowledge_base_data' ||
                             tool?.name?.toLowerCase().includes('get knowledge database') || 
                             tool?.name?.toLowerCase().includes('knowledge') ||
                             tool?.name?.toLowerCase().includes('rag');

    if (isKnowledgeDbTool && tool?.args) {
      try {
        // Extract document ID from tool arguments
        let documentId = null;
        
        // Check various possible argument structures
        if (typeof tool.args === 'string') {
          try {
            const parsedArgs = JSON.parse(tool.args);
            documentId = parsedArgs.document_id || parsedArgs.documentId || parsedArgs.id;
          } catch (e) {
            // If parsing fails, treat as plain text
            documentId = tool.args;
          }
        } else if (typeof tool.args === 'object') {
          documentId = tool.args.document_id || tool.args.documentId || tool.args.id;
        }

        if (documentId) {
          // Find the document in knowledge base data
          const document = knowledgeBaseData.find(doc => 
            doc.id === documentId || 
            doc.document_id === documentId ||
            doc._id === documentId
          );

          if (document && document.url) {
            openSlider({
              title: document.title || `Document ${documentId}`,
              url: document.url
            });
            return;
          }
        }
      } catch (error) {
        console.error('Error processing knowledge base tool:', error);
      }
    }
    if (tool?.data?.metadata?.type === 'agent') {
      return;
    }
    openViasocket(tool?.id, {
      flowHitId: tool?.data?.metadata?.flowHitId,
      embedToken,
      meta: {
        type: 'tool',
        bridge_id: params?.id,
      }
    });
  }, [knowledgeBaseData, openSlider, embedToken, params?.id]);

  const renderToolData = useCallback((tool, index) => (
    <div key={index} className="bg-base-200 rounded-lg flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1">
      <div onClick={(event) => handleToolPrimaryClick(event, tool)}
        className="cursor-pointer flex items-center justify-center py-4 pl-2">
        <div className="text-center">
          {truncate(integrationData?.[tool.name]?.title || tool?.name, 20)}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="tooltip tooltip-top relative text-base-content" data-tip="function logs">
          <SquareFunctionIcon size={22}
            onClick={(event) => handleToolPrimaryClick(event, tool)}
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
  ), [handleToolPrimaryClick, integrationData, setToolsData]);

  const handleUserButtonClick = (value) => {
    threadHandler(item.thread_id, item, value)
  }

  const handleAskAi = async (item) => {
    const aiconfig = handleAddTestCase(item, index, true)
    let variables = { aiconfig, response: item?.chatbot_message ? item?.chatbot_message : item?.llm_message }
    try {
      const systemPromptResponse = item.prompt;
      variables = { "System Prompt": systemPromptResponse, ...variables }
    } catch (error) {
      console.error("Failed to fetch single message:", error);
    }
    window.SendDataToChatbot({
      "parentId": '',
      "bridgeName": "history_page_chabot",
      "threadId": String(item?.id),
      variables,
      version_id: 'null',
      hideCloseButton: 'false'
    });
    setTimeout(() => window.openChatbot(), 100)
  }

  // Render attachments (images / pdf / video) for a message bubble
  const renderAttachments = (attachments = []) => {
    if (!attachments.length) return null;

    const formatAttachmentName = (url = "") => {
      if (!url) return "Attachment";
      try {
        const cleanUrl = decodeURIComponent(url.split("?")[0]);
        const segments = cleanUrl.split("/");
        return segments.pop() || "Attachment";
      } catch (error) {
        return "Attachment";
      }
    };

    const getSourceLabel = (source) => (source && source.toLowerCase() === "user" ? "USER" : "LLM");

    const openAttachment = (url) => {
      if (!url) return;
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    };

    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-3">
          {attachments.map((attachment, index) => {
            const attachmentUrl = attachment.resolvedUrl || attachment.permanent_url || attachment.url;

            if (!attachmentUrl) {
              return (
                <div key={`assistant-img-fallback-${index}`} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                  <ImageFallback type="large" error="failed_to_load" />
                </div>
              );
            }

            const typeLabel = (attachment.normalizedType || "file").toUpperCase();
            const sourceLabel = getSourceLabel(attachment.source);
            const overlayLabel = `${typeLabel} - ${sourceLabel}`;

            if (attachment.normalizedType === "video") {
              return (
                <div key={`assistant-video-${index}`} className="relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                  <video
                    src={attachmentUrl}
                    controls
                    className="w-full rounded-lg border border-base-300 bg-black max-h-96"
                    preload="metadata"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide">
                    {overlayLabel}
                  </span>
                </div>
              );
            }

            if (attachment.normalizedType === "pdf" || attachment.normalizedType === "file") {
              return (
                <div key={`assistant-doc-${index}`} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                  <div className="bg-base-100 border border-base-300 rounded-lg p-4 h-full flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-base-content/70">
                      <div className="flex items-center gap-2">
                        {attachment.normalizedType === "pdf" ? (
                          <PdfIcon height={20} width={20} />
                        ) : (
                          <FileTextIcon className="w-5 h-5" />
                        )}
                        <span className="font-semibold uppercase tracking-wide">{typeLabel}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase bg-base-200 px-2 py-1 rounded-full tracking-wide text-base-content">
                        {sourceLabel}
                      </span>
                    </div>
                    <p className="text-sm font-medium break-words text-base-content">
                      {truncate(formatAttachmentName(attachmentUrl), 40)}
                    </p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline w-fit"
                      onClick={() => openAttachment(attachmentUrl)}
                    >
                      <ExternalLink size={14} />
                      <span>Open</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={`assistant-img-${index}`} className="relative w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[280px]">
                <EnhancedImage
                  src={attachmentUrl}
                  alt={`Assistant attachment ${index + 1}`}
                  width={280}
                  height={180}
                  className="max-w-full max-h-96 w-auto h-auto object-cover"
                  type="large"
                />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide">
                  {overlayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div key={`item-id-${item?.id}`} id={`message-${messageId}`} ref={(el) => (threadRefs.current[messageId] = el)} className="text-sm">
      <div className="show-on-hover">
        {/* 1. First: Render User Message if exists */}
            <div className="chat group chat-end mb-4">
              <div className="chat-image avatar flex justify-center items-center">
                <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center hover:bg-base-300/80 transition-colors">
                  <div className="relative rounded-full bg-base-300 flex justify-center items-center">
                    <UserIcon size={20} className="text-base-content" />
                  </div>
                </div>
              </div>
              <div className="flex justify-start flex-row-reverse items-center gap-1" style={{ width: "-webkit-fill-available" }}>
                <div className="chat-bubble-primary chat-bubble transition-all ease-in-out duration-300 relative group break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-line" }}>
                  <ReactMarkdown components={{
                    code: ({ node, inline, className, children, ...props }) => (
                      <CodeBlock className={className} {...props}>
                        {children}
                      </CodeBlock>
                    )
                  }}>
                    {item.user}
                  </ReactMarkdown>

                  {/* User attachments */}
                  {renderAttachments(normalizeImageUrls(item?.user_urls, "user"))}
                </div>
              </div>
              
              {/* User message footer with timestamp and actions */}
              <div className="flex flex-row-reverse gap-2 m-1 items-center justify-between">
                <time className="text-xs opacity-50 chat-end relative">
                  <span className="group-hover:hidden">
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <span className="hidden group-hover:inline">
                    {formatDateAndTime(item.created_at)}
                  </span>
                </time>
                <div className="flex gap-1 opacity-70 hover:opacity-100 transition-opacity see-on-hover">
                  <button
                    className={`btn text-xs font-normal btn-sm hover:btn-primary ${
                      isLastMessage() ? '' : 'see-on-hover'
                    }`}
                    onClick={() => handleUserButtonClick("AiConfig")}
                  >
                    <SquareFunctionIcon className="h-3 w-3" />
                    <span>AI Config</span>
                  </button>
                  <button
                    className={`btn text-xs font-normal btn-sm hover:btn-primary ${
                      isLastMessage() ? '' : 'see-on-hover'
                    }`}
                    onClick={() => handleUserButtonClick("variables")}
                  >
                    <ParenthesesIcon className="h-3 w-3" />
                    <span>Variables</span>
                  </button>
                  <button
                    className={`btn text-xs font-normal btn-sm hover:btn-primary ${
                      isLastMessage() ? '' : 'see-on-hover'
                    }`}
                    onClick={() => handleUserButtonClick("system Prompt")}
                  >
                    <FileClockIcon className="h-3 w-3" />
                    <span>System Prompt</span>
                  </button>
                  <button
                    className={`btn text-xs font-normal btn-sm hover:btn-primary ${
                      isLastMessage() ? '' : 'see-on-hover'
                    }`}
                    onClick={() => handleUserButtonClick("more")}
                  >
                    <AddIcon className="h-3 w-3" />
                    <span>More...</span>
                  </button>
                </div>
              </div>
            </div>

        {/* 2. Second: Show Tools Call section if exists */}
        {(item?.tools_call_data?.length > 0 || item?.function) && (
          <div className="mb-2 text-sm flex flex-col justify-center items-center">
            <h1 className="p-1">
              <span className="flex justify-center items-center gap-2"><ParenthesesIcon size={16} />Functions Executed Successfully</span>
            </h1>
            <div className="flex h-full gap-2 justify-center items-center flex-wrap">
              {item?.tools_call_data ? item.tools_call_data.map((toolObj, index) => {
                // Handle the new data structure where each tool is an object with complex keys
                const toolKey = Object.keys(toolObj)[0]; // Get the first (and likely only) key
                const tool = toolObj[toolKey]; // Get the tool data
                
                return (
                  <div key={index} 
                  onClick={(event) => handleToolPrimaryClick(event, tool)}
                  className="bg-base-200 rounded-lg flex gap-4 duration-200 items-center justify-between hover:bg-base-300 p-1 see">
                    <div className="cursor-pointer flex items-center justify-center py-4 pl-2">
                      <div className="text-center">
                        <div className="font-medium text-sm">{tool?.name || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="tooltip tooltip-top relative text-base-content" data-tip="function logs">
                        <SquareFunctionIcon size={22}
                          onClick={(event) => handleToolPrimaryClick(event, tool)}
                          className="opacity-80 cursor-pointer" />
                      </div>
                      <div className="tooltip tooltip-top pr-2 relative text-base-content" data-tip="function data">
                        <FileClockIcon
                          size={22}
                          onClick={(e) => {
                            e.stopPropagation();
                            setToolsData(tool);
                            toolsDataModalRef.current?.showModal();
                          }}
                          className="opacity-80 bg-inherit cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              }) : (item?.function ? Object.keys(item.function).map(renderToolData) : [])}
              <button
                className={`btn text-xs font-normal btn-sm  ${isLastMessage() ? '' : 'see-on-hover'}`}
                onClick={() => handleAddTestCase(item, index)}
              >
                <div className="flex items-center gap-1 text-xs font-normal px-1 py-1 rounded-md text-primary hover:text-primary/80 transition-colors">
                  <AddIcon className="h-3 w-3" />
                  <span>Test Case</span>
                </div>
              </button>
            </div>
          </div>
        )}

          {/* 3. Third: Render Assistant Message if exists */}
          {(!item.error) && (
            <div className="chat group chat-start">
              <div className="chat-image avatar flex justify-center items-center">
                <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center hover:bg-base-300/80 transition-colors mb-7">
                  <div className="relative rounded-full bg-base-300 flex justify-center items-center">
                    <BotIcon
                      className="cursor-pointer bot-icon text-base-content"
                      size={20}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropupOpen(!isDropupOpen);
                      }}
                    />
                    {isDropupOpen && (
                      <div
                        ref={dropupRef}
                        className="absolute bg-red-500 text-white rounded-md shadow-lg border-2 border-black min-w-[150px] min-h-[100px]"
                        style={{ 
                          zIndex: 9999,
                          top: '-120px',
                          left: '-75px',
                          backgroundColor: 'red',
                          border: '2px solid black',
                          padding: '10px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ color: 'white', fontSize: '14px' }}>
                          TEST DROPDOWN VISIBLE
                        </div>
                        <ul className="flex justify-center flex-col items-center gap-2 p-2">
                          {item.chatbot_message && (
                            <li>
                              <button
                                className={`px-2 py-1 rounded-md ${messageType === 'chatbot_message' || messageType === 0 ? "bg-primary text-white" : "hover:bg-base-200"
                                  }`}
                                onClick={() => selectMessageType('chatbot_message')}
                              >
                                <div className="tooltip tooltip-right" data-tip="Chatbot Response">
                                  <BotIcon className={`${messageType !== 'chatbot_message' && messageType !== 0 ? "text-base-content" : "text-white"}`} size={16} />
                                </div>
                              </button>
                            </li>
                          )}
                          {item.llm_message && (
                            <li>
                              <button
                                className={`px-2 py-1 rounded-md ${messageType === 'llm_message' || messageType === 1 ? "bg-primary text-white" : "hover:bg-base-200"
                                  }`}
                                onClick={() => selectMessageType('llm_message')}
                              >
                                <div className="tooltip tooltip-right" data-tip="LLM Response">
                                  <CodeMessageIcon className={`${messageType !== 'llm_message' && messageType !== 1 ? "text-base-content" : "text-white"}`} size={16} />
                                </div>
                              </button>
                            </li>
                          )}
                          {item.updated_llm_message && (
                            <li>
                              <button
                                className={`px-2 py-1 rounded-md ${messageType === 'updated_llm_message' || messageType === 2 ? "bg-primary text-white" : "hover:bg-base-200"
                                  }`}
                                onClick={() => selectMessageType('updated_llm_message')}
                              >
                                <div className="tooltip tooltip-right" data-tip="Updated Message">
                                  <PencilIcon className={`${messageType !== 'updated_llm_message' && messageType !== 2 ? "text-base-content" : "text-white"}`} size={16} />
                                </div>
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-header flex gap-4 items-center mb-1">
                {messageType === 'updated_llm_message' && <p className="text-xs opacity-50 badge badge-sm badge-outline">Edited</p>}
              </div>
              <div className="flex justify-start items-center gap-1 show-on-hover" style={{ width: "-webkit-fill-available" }}>
                <div className="bg-base-200 text-base-content pr-10 mb-7 chat-bubble transition-all ease-in-out duration-300 relative group break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-line" }}>
                  {/* Assistant attachments */}
                  {renderAttachments(normalizeImageUrls(item?.llm_urls, "llm"))}

                  {/* Message content */}
                  <ReactMarkdown components={{
                    code: ({ node, inline, className, children, ...props }) => (
                      <CodeBlock className={className} {...props}>
                        {children}
                      </CodeBlock>
                    )
                  }}>
                    {getMessageToDisplay()}
                  </ReactMarkdown>

                  {/* Edit button for assistant messages */}
                  {!item?.image_urls?.length && !item?.fromRTLayer && (
                    <div className={`tooltip absolute top-2 right-2 text-sm cursor-pointer transition-opacity ${isLastMessage() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} data-tip="Edit message">
                      <button
                        className="btn btn-sm btn-circle btn-ghost hover:btn-primary text-base-content"
                        onClick={handleEdit}
                      >
                        <PencilIcon size={14} />
                      </button>
                    </div>
                  )}

                  {/* Action buttons for assistant messages */}
                  <div className={`absolute bottom-[-40px] see-on-hover left-0 flex gap-2 mt-2transition-opacity z-10 ${
                    isLastMessage() ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'
                  }`}>
                    <button
                      className="btn text-xs font-normal btn-sm hover:btn-primary"
                      onClick={() => handleAddTestCase(item, index)}
                    >
                      <AddIcon className="h-3 w-3" />
                      <span>Test Case</span>
                    </button>
                    <button
                      className="btn text-xs font-normal btn-sm hover:btn-primary"
                      onClick={() => handleAskAi(item)}
                    >
                      <BotMessageIcon className="h-3 w-3" />
                      <span>Debug Agent</span>
                    </button>
                  </div>
                </div>
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

      <ToolsDataModal toolsData={toolsData} handleClose={handleCloseToolsDataModal} toolsDataModalRef={toolsDataModalRef} integrationData={integrationData} />
      
      {/* Generic Slider for Knowledge Base Documents */}
      <GenericSlider
        isOpen={sliderState.isOpen}
        onClose={closeSlider}
        title={sliderState.title}
        url={sliderState.url}
        addSourceParam={false}
      />
    </div>
  );
};

export default ThreadItem;
