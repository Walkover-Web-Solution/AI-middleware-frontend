import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import cloneDeep from 'lodash/cloneDeep';
import CodeBlock from "../codeBlock/codeBlock";
import ChatTextInput from "./chatTextInput";
import { dryRun } from "@/config";
import { PdfIcon } from "@/icons/pdfIcon";
import { truncate } from "../historyPageComponents/assistFile";
import { AlertIcon, CloseCircleIcon } from "@/components/Icons";
import { FINISH_REASON_DESCRIPTIONS } from '@/utils/enums';
import { ExternalLink, Menu, PlayIcon, PlusIcon, Zap, CheckCircle, Target, ToggleLeft, ToggleRight, Edit2, Save, X, Bot } from "lucide-react";
import TestCaseSidebar from "./TestCaseSidebar";
import AddTestCaseModal from "../modals/AddTestCaseModal";
import { createConversationForTestCase } from "@/utils/utility";
import { runTestCaseAction } from "@/store/action/testCasesAction";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customHooks/customSelector";
import Protected from "../protected";
import ReactMarkdown from "../LazyMarkdown";


function Chat({ params, userMessage, isOrchestralModel = false, searchParams, isEmbedUser }) {
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testCaseConversation, setTestCaseConversation] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showTestCases, setShowTestCases] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('exact');
  const [testCaseId, setTestCaseId] = useState(null);
  const [currentRunIndex, setCurrentRunIndex] = useState(null);
  const [isRunningTestCase, setIsRunningTestCase] = useState(false);
  const [showTestCaseResults, setShowTestCaseResults] = useState({});
  const [isLoadingTestCase, setIsLoadingTestCase] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');

  const bridgeType = useCustomSelector((state) => state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleResetChat = () => {
    setTestCaseId(null);
    setMessages([]);
    setConversation([]);
    setEditingMessage(null);
    setEditContent('');
    
    // Focus on input field after reset
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }

  const handleEditMessage = (messageId, currentContent) => {
    setEditingMessage(messageId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = (messageId) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, content: editContent, isEdited: true } : msg
    );
    setMessages(updatedMessages);

    // Also update the conversation array for backend
    const editedMessage = messages.find(msg => msg.id === messageId);
    if (editedMessage && editedMessage.sender !== 'expected') {
      // Create updated conversation from current messages
      const updatedConversation = [];
      updatedMessages.forEach(msg => {
        if (msg.sender === 'user' || msg.sender === 'assistant') {
          updatedConversation.push({
            role: msg.sender === 'user' ? 'user' : msg?.testCaseResult ? 'Model Answer' : 'assistant',
            content: msg.content
          });
        }
      });
      setConversation(updatedConversation);
    }

    setEditingMessage(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleTestCaseClick = async (testCaseConversation, expected) => {
    setIsLoadingTestCase(true);

    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      // Convert testcase conversation to chat messages format
      const convertedMessages = [];
      const baseTimestamp = Date.now();

      testCaseConversation.forEach((msg, index) => {
        const chatMessage = {
          id: `testcase_${msg.role}_${baseTimestamp}_${index}`,
          sender: msg.role === 'user' ? 'user' : 'assistant',
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
        convertedMessages.push(chatMessage);
      });

      if (expected?.response) {
        const expectedMessage = {
          id: `testcase_expected_${baseTimestamp}`,
          sender: 'expected',
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: expected.response,
          isExpected: true,
        };
        convertedMessages.push(expectedMessage);
      }

      // Set the messages and conversation
      setMessages(convertedMessages);

      // Convert to conversation format for the backend
      const backendConversation = testCaseConversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      setConversation(backendConversation);

      // Close testcase sidebar
      setShowTestCases(false);
    } finally {
      setIsLoadingTestCase(false);
    }
  }

  const handleSendMessageForOrchestralModel = async (userMessage) => {
    const newMessage = userMessage ? userMessage.replace(/\r?\n/g, '\n') : inputRef?.current?.value.replace(/\r?\n/g, '\n');
    if (newMessage?.trim() === "") return;
    if (inputRef.current) {
      inputRef.current.style.height = '40px'; // Set initial height
    }
    setErrorMessage("");
    inputRef.current.value = "";
    setLoading(true);
    try {
      // Generate unique IDs using timestamp to avoid conflicts
      const timestamp = Date.now();
      const newChat = {
        id: `user_${timestamp}`,
        sender: "user",
        playground: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: newMessage.replace(/\n/g, "  \n"), // Markdown line break
      };
      let response, responseData;
      let data;
      data = {
        role: "user",
        content: newMessage,
      };
      setMessages(prevMessages => [...prevMessages, newChat]);

      // Insert a temporary assistant "typing" message
      const tempAssistantId = `assistant_${timestamp}`;
      const loadingAssistant = {
        id: tempAssistantId,
        sender: "assistant",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: "",
        isLoading: true,
      };
      setMessages(prev => [...prev, loadingAssistant]);
      responseData = await dryRun({
        localDataToSend: {

          configuration: {
            conversation: conversation,
          },
          user: data.content,
          orchestrator_id: params.orchestralId
        },
        orchestrator_id: params.orchestralId
      });

      response = responseData.response?.data;
      const content = response?.content || "";
      const assistConversation = {
        role: response?.role || "assistant",
        content: content,
        fallback: response?.fallback,
        firstAttemptError: response?.firstAttemptError,
        image_urls: response?.image_urls || [],
        model: response?.model,
        finish_reason: response?.finish_reason
      };

      // Update conversation and keep only last 6 messages
      const updatedConversation = [...conversation, cloneDeep(data), assistConversation].slice(-6);
      setConversation(updatedConversation);

      const newChatAssist = {
        id: tempAssistantId,
        sender: "assistant",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: Array.isArray(content) ? content.join(", ") : content.toString(),
        image_urls: assistConversation.image_urls,
        fallback: assistConversation?.fallback,
        firstAttemptError: response?.firstAttemptError,
        modelName: assistConversation?.model,
        finish_reason: assistConversation?.finish_reason
      };

      // Replace the temporary loading message with the actual response
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(m => m.id === tempAssistantId ? newChatAssist : m);
        return updatedMessages;
      });
    } catch (error) {
      console.log(error);
      setErrorMessage("Something went wrong. Please try again.");
      // Remove the temporary loading assistant message on error
      setMessages(prev => prev.filter(m => m.id !== tempAssistantId));
    } finally {
      setLoading(false);
      setUploadedImages([]);
    }

  }

  useEffect(() => {
    handleSendMessageForOrchestralModel(userMessage);
  }, [userMessage]);

  const handleRunTestCase = async (index) => {
    const conversationForTestCase = messages.slice(-6, index + 1)
    conversationForTestCase.push(messages[index + 1])
    const { conversation, expected } = createConversationForTestCase(conversationForTestCase)
    setCurrentRunIndex(index)
    setIsRunningTestCase(true)
    const testCaseData = {
      conversation,
      expected,
      matching_type: selectedStrategy
    }
    try {
      const data = await dispatch(runTestCaseAction({ versionId: searchParams.version, bridgeId: null, testcase_id: null, testCaseData }))
      const updatedMessages = [...messages]
      updatedMessages[index + 1] = {
        ...updatedMessages[index + 1],
        testCaseResult: data?.results?.[0]
      }
      setMessages(updatedMessages)
    } finally {
      setIsRunningTestCase(false)
      setCurrentRunIndex(null)
    }
  };

  // Opens the embedded chatbot panel and sends any necessary data beforehand
  const handleOpenChatbot = () => {
    // Send data first (if host page exposes the bridge functions)
    if (typeof window !== 'undefined' && typeof window.sendDataToChatbot === 'function') {
      window.sendDataToChatbot({ parentId: 'parentChatbot' });
    }

    // Then open after a short delay to ensure data is processed
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.openChatbot === 'function') {
        window.openChatbot();
      }
    }, 200);
  };

  return (
    <div className="px-4 pt-4 bg-base-100">
      <div className="w-full flex justify-between items-center px-2">
        <button
          className="btn btn-sm btn-square"
          onClick={() => setShowTestCases(!showTestCases)}
          title="Toggle Test Cases"
        >
          <div
            className="flex items-center gap-2 tooltip tooltip-right"
            data-tip={showTestCases ? "Hide Test Cases" : "Show Test Cases"}
          >
            {showTestCases ? <CloseCircleIcon /> : <Menu />}
          </div>
        </button>
        <span className="label-text">Experiments</span>
        <div className="flex items-center gap-2">
          
          {messages?.length > 0 && (
            <div className="flex items-center gap-2 justify-center">
              <select
                className="select select-sm select-bordered"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
              >
                <option value="cosine">Cosine</option>
                <option value="ai">AI</option>
                <option value="exact">Exact</option>
              </select>
              <button className="btn btn-sm" onClick={handleResetChat}> <PlusIcon size={14} />Add Test Case</button>
            </div>
          )}
          {!isOrchestralModel && !isEmbedUser && bridgeType === 'chatbot' && <button
            className="btn btn-sm btn-primary"
            onClick={handleOpenChatbot}
            title="Open Chatbot"
          >
            <div className="tooltip tooltip-left" data-tip="Open Chatbot">
              <Bot size={14}/>
            </div>
          </button>}
          {/* Test Cases Toggle Button */}
        </div>
        
      </div>
      

      <div className="flex mt-4 h-[83vh] overflow-hidden relative">
        {/* Overlay Test Cases Sidebar */}
        {showTestCases && (
          <div className="absolute inset-0 z-low flex">
            {/* Optional backdrop */}
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowTestCases(false)}
            ></div>

            {/* Sidebar */}
            <div className="relative w-[70%] h-full border border-base-content/30 rounded-md bg-base-100 shadow-lg z-30 animate-slideIn">
              <TestCaseSidebar params={params} resolvedParams={searchParams} onTestCaseClick={handleTestCaseClick} />
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className="w-full flex-grow min-w-0 relative">
          {/* Loading overlay for testcase loading */}
          {isLoadingTestCase && (
            <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center rounded-md z-50">
              <div className="flex items-center gap-3 bg-base-100 p-4 rounded-lg shadow-lg border border-base-content/20">
                <span className="loading loading-spinner loading-md text-primary"></span>
                <span className="text-base font-medium">Loading test case conversation...</span>
              </div>
            </div>
          )}
          
          <div className="sm:p-2 justify-between flex flex-col h-full min-h-0 border border-base-content/30 rounded-md w-full z-low">
            <div ref={messagesContainerRef} className="flex flex-col w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-1 mb-4 pr-2">
              {messages.map((message, index) => {
                return (
                  <div
                    key={index}
                    className={`chat show-on-hover ${message.sender === "user"
                      ? "chat-end flex flex-col mt-2"
                      : "chat-start"
                      }`}
                  >
                    <div className="chat-image avatar"></div>
                    <div className="chat-header">
                      {message.sender === "expected" ? "Expected Response" : message.testCaseResult ? "Model Answer" : message.sender}
                      {message.isEdited && (
                        <span className="text-xs text-warning ml-2 font-medium">(edited)</span>
                      )}
                      <time className="text-xs opacity-50 pl-2">
                        {message.time}
                      </time>
                      {message?.sender === "assistant" && message?.fallback && (
                        <div className="my-1">
                          <div className="max-w-[30rem] text-primary rounded-lg text-xs overflow-hidden transition-all duration-200 hover:bg-base-200/90">
                            <input
                              type="checkbox"
                              id={`retry-${message.id}`}
                              className="peer hidden"
                            />

                            <label
                              htmlFor={`retry-${message.id}`}
                              className="px-3 py-1.5 min-h-0 h-7 leading-none cursor-pointer flex items-center justify-between w-full gap-2 transition-all duration-200 hover:bg-base-300/20 peer-checked:bg-base-300/30 flex-row-reverse"
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-xs opacity-80">↻</span>
                                <span className="truncate">Retried with</span>
                                <span className="font-medium truncate text-primary/90">
                                  {message?.modelName}
                                </span>
                              </div>
                            </label>

                            <div className="max-h-0 peer-checked:max-h-96 transition-all duration-300 ease-in-out overflow-hidden bg-base-300/10">
                              <pre className="text-xs text-error/90 whitespace-pre-wrap px-3 py-2 leading-relaxed">
                                {message.firstAttemptError}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {message?.sender === "assistant" &&
                        message?.finish_reason &&
                        message.finish_reason !== "completed" &&
                        message.finish_reason !== "no_reason" && (
                          <div className="my-1">
                            <div className="max-w-[30rem] bg-base-200/50 border border-warning/20 rounded-md px-3 py-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <AlertIcon
                                    size={12}
                                    className="text-warning flex-shrink-0"
                                  />
                                  <span className="text-xs text-base-content/80 leading-tight">
                                    {
                                      FINISH_REASON_DESCRIPTIONS[
                                      message.finish_reason
                                      ]
                                    }
                                  </span>
                                </div>
                                <a
                                  href="https://gtwy.ai/blogs/finish-reasons?source=single"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-warning/70 hover:text-warning transition-colors flex-shrink-0 ml-2"
                                  title="More details"
                                >
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    {(message?.images?.length > 0 || message?.files?.length > 0) && (
                      <div className="mt-2">
                        {message?.images?.length > 0 && (
                          <div className="flex flex-wrap items-end justify-end">
                            {message.images.map((url, imgIndex) => (
                              <Image
                                key={imgIndex}
                                src={url}
                                alt={`Message Image ${imgIndex + 1}`}
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover m-1 rounded-lg cursor-pointer"
                                onClick={() => window.open(url, "_blank")}
                              />
                            ))}
                          </div>
                        )}

                        {message?.files?.length > 0 && (
                          <div className="flex flex-wrap items-end justify-end space-x-2 bg-base-200 p-2 rounded-md mb-1">
                            {message.files.map((url, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 hover:underline"
                              >
                                <PdfIcon height={20} width={20} />
                                <span className="text-sm overflow-hidden truncate max-w-[10rem]">
                                  {truncate(url.split("/").pop(), 20)}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {message?.sender === "tools_call" &&
                      message?.tools_call_data && (
                        <div className="flex flex-wrap justify-center items-center gap-2 my-2">
                          {Object.entries(message.tools_call_data).map(
                            ([functionName]) => (
                              <div
                                key={functionName}
                                className="bg-base-200 border border-base-content/20 rounded-md p-2 min-w-[120px] max-w-[200px] shadow-sm"
                              >
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Zap className="text-base-content" size={14} />
                                  </div>
                                  <span className="text-xs font-medium text-base-content/80">
                                    Function
                                  </span>
                                </div>
                                <div className="text-center">
                                  <div
                                    className="text-sm font-semibold text-primary mb-1 truncate"
                                    title={functionName}
                                  >
                                    {functionName}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {(message.sender === "user" ||
                      message.sender === "assistant" ||
                      message.sender === "expected") &&
                      (message?.content || message?.isLoading) && (
                        <div className={`flex gap-2 show-on-hover justify-start max-w-[700px] items-center relative ${editingMessage === message.id && message.sender === "assistant" ? 'w-[500px]' : ''}`}>
                          {message?.sender === "user" && message?.content && (
                            <button
                              className="btn btn-xs btn-outline hover:btn-primary see-on-hover flex mt-2"
                              onClick={() => handleRunTestCase(index)}
                              disabled={isRunningTestCase}
                            >
                              <PlayIcon className="h-3 w-3" />
                              <span>Run</span>
                            </button>
                          )}

                          {/* Show either assistant message or test case result */}
                          {message?.testCaseResult && showTestCaseResults[message.id] ? (
                            /* Test Case Result Display */
                            <div className="chat-bubble gap-0 relative min-w-full">
                              <div className="bg-neutral/90 border border-neutral-content/20 rounded-lg p-4 text-neutral-content">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-4">
                                  <Target className="h-4 w-4" />
                                  <span className="text-sm font-medium">Test Case Result</span>
                                  {message.testCaseResult.success && (
                                    <CheckCircle className="h-4 w-4 text-success ml-auto" />
                                  )}
                                </div>

                                {/* Similarity Score */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-neutral-content/80">SIMILARITY SCORE</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-12 bg-neutral-content/20 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${message.testCaseResult.score >= 0.8 ? 'bg-success' :
                                            message.testCaseResult.score >= 0.6 ? 'bg-warning' : 'bg-error'
                                          }`}
                                        style={{ width: `${Math.max(message.testCaseResult.score * 100, 8)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium">
                                      {(message.testCaseResult.score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>

                                {/* Method */}
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-sm font-medium text-neutral-content/80">METHOD</span>
                                  <span className="text-sm font-medium capitalize">
                                    {message.testCaseResult.matching_type}
                                  </span>
                                </div>

                                {/* Expected */}
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-neutral-content/80 block mb-2">EXPECTED</span>
                                  <div className="text-sm bg-neutral-content/10 rounded-md p-3 border border-neutral-content/20">
                                    {message.testCaseResult.expected?.response || 'No expected response'}
                                  </div>
                                </div>

                                {/* Actual */}
                                <div>
                                  <span className="text-sm font-medium text-neutral-content/80 block mb-2">ACTUAL</span>
                                  <div className="text-sm bg-neutral-content/10 rounded-md p-3 border border-neutral-content/20">
                                    {message.testCaseResult.actual_result || 'No actual result'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Regular Assistant/User/Expected Message - Show model answer if testcase was run */
                            <div className={`chat-bubble break-all gap-0 justify-start relative w-full ${message.sender === "assistant" ? "mr-8" : ""}`}>
                              {/* Show loader overlay if this is the message being tested */}
                              {isRunningTestCase && currentRunIndex !== null && index === currentRunIndex + 1 && (
                                <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                                  <div className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="text-sm font-medium">Running Test Case...</span>
                                  </div>
                                </div>
                              )}

                              {/* Edit Mode */}
                              {editingMessage === message.id ? (
                                <div className="w-full">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="textarea textarea-bordered w-full min-h-[100px] resize-y text-base-content bg-base-100"
                                    placeholder="Edit message content..."
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleSaveEdit(message.id)}
                                      className="btn btn-xs btn-success"
                                    >
                                      <Save className="h-3 w-3" />
                                      Save
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="btn btn-xs btn-error"
                                    >
                                      <X className="h-3 w-3" />
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Display Mode */
                                <div className="relative group">
                                  {/* Edit Button for Assistant Messages */}
                                  {message.sender === "assistant" && !message.isLoading && (
                                    <button
                                      onClick={() => handleEditMessage(message.id, message.content)}
                                      className="absolute -top-2 -right-5 opacity-0 group-hover:opacity-100 transition-opacity btn btn-xs btn-circle btn-ghost"
                                      title="Edit message"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                  )}

                                  {/* Loading state for assistant message */}
                                  {message.isLoading ? (
                                    <div className="py-1">
                                      <span className="loading loading-dots loading-sm"></span>
                                    </div>
                                  ) : message.sender === "expected" ? (
                                    /* Expected Response - Plain text display with label */
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                  ) : (
                                    /* Regular message with markdown */
                                    <ReactMarkdown
                                      components={{
                                        code: ({
                                          node,
                                          inline,
                                          className,
                                          children,
                                          ...props
                                        }) => (
                                          <CodeBlock
                                            inline={inline}
                                            className={className}
                                            isDark={true}
                                            {...props}
                                          >
                                            {children}
                                          </CodeBlock>
                                        ),
                                      }}
                                    >
                                      {/* Show model's actual response if testcase was run, otherwise show original content */}
                                      {message.testCaseResult && message.sender === "assistant" 
                                        ? message.testCaseResult.actual_result || message.content
                                        : message.content}
                                    </ReactMarkdown>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Absolute Toggle Button for Test Case Results */}
                          {message?.testCaseResult && (
                            <button
                              onClick={() => setShowTestCaseResults(prev => ({
                                ...prev,
                                [message.id]: !prev[message.id]
                              }))}
                              className="absolute -bottom-8 left-4 flex items-center gap-2 text-xs text-base-content/70 hover:text-base-content transition-colors px-2 py-1 rounded-full bg-base-100 border border-base-content/20 shadow-sm hover:bg-base-200/50"
                            >
                              {showTestCaseResults[message.id] ? (
                                <>
                                  <ToggleRight className="h-3 w-3" />
                                  <span>Model Answer</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-3 w-3" />
                                  <span>Test Details</span>
                                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${message.testCaseResult.score >= 0.8 ? 'bg-success/20 text-success' :
                                      message.testCaseResult.score >= 0.6 ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                                    }`}>
                                    {(message.testCaseResult.score * 100).toFixed(1)}%
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                      )}
                  </div>
                );
              })}
            </div>

            <div className="border-t-2 border-base-content/30 px-4 pt-4 mb-2 sm:mb-0 w-full">
              <div className="relative flex flex-col gap-4 w-full">
                <div className="flex flex-row gap-2">
                  <ChatTextInput
                    setErrorMessage={setErrorMessage}
                    setMessages={setMessages}
                    message={messages}
                    params={params}
                    searchParams={searchParams}
                    uploadedImages={uploadedImages}
                    setUploadedImages={setUploadedImages}
                    conversation={conversation}
                    setConversation={setConversation}
                    isOrchestralModel={isOrchestralModel}
                    handleSendMessageForOrchestralModel={handleSendMessageForOrchestralModel}
                    inputRef={inputRef}
                    loading={loading}
                    setLoading={setLoading}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    setTestCaseId={setTestCaseId}
                    testCaseId={testCaseId}
                    selectedStrategy={selectedStrategy}
                    setSelectedStrategy={setSelectedStrategy}
                  />
                </div>
              </div>
              {errorMessage && (
                <div className="text-red-500 mt-2">{errorMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddTestCaseModal testCaseConversation={testCaseConversation} setTestCaseConversation={setTestCaseConversation} />
    </div>
  );
}

export default Protected(Chat);