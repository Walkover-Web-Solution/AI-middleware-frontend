import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import CodeBlock from "../codeBlock/codeBlock";
import ChatTextInput from "./chatTextInput";
import { dryRun } from "@/config";
import { PdfIcon } from "@/icons/pdfIcon";
import { truncate } from "../historyPageComponents/assistFile";
import { AlertIcon } from "@/components/Icons";
import { FINISH_REASON_DESCRIPTIONS } from '@/utils/enums';
import { ExternalLink } from "lucide-react";


function Chat({ params, userMessage, isOrchestralModel = false, searchParams }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(userMessage ? [{
    id: Date.now(),
    sender: "user",
    content: userMessage,
    time: new Date().toLocaleString()
  }] : []);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleResetChat = () => {
    setMessages([]);
    setConversation([]);
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
      const newChat = {
        id: conversation.length + 1,
        sender: "user",
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

      setConversation(prevConversation => [...prevConversation, _.cloneDeep(data), assistConversation].slice(-6));
      const newChatAssist = {
        id: conversation.length + 2,
        sender: "Assist",
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

      setMessages(prevMessages => [...prevMessages, newChatAssist]);
    } catch (error) {
      console.log(error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setUploadedImages([]);
    }

  }
  useEffect(() => {
    handleSendMessageForOrchestralModel(userMessage);
  }, [userMessage]);

  return (
    <div className="px-4 pt-4 bg-base-100">
      <div className="w-full flex justify-between items-center px-2">
        <span className="label-text">Playground</span>
        {messages?.length > 0 && <button className="btn btn-sm" onClick={handleResetChat}>Reset Chat</button>}
      </div>

      <div className="sm:p-2 mt-4 justify-between flex flex-col h-[83vh] border border-base-content/30 rounded-md w-full z-low">
        <div
          id="messages"
          className="flex flex-col w-full overflow-y-auto overflow-x-hidden scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-1 mb-4 pr-2"
        >
          {messages.map((message, index) => {
            return (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? messagesEndRef : null}
                className={`chat ${message.sender === "user" ? "chat-end flex flex-col" : "chat-start"}`}
              >
                <div className="chat-image avatar"></div>
                <div className="chat-header">
                  {message.sender}
                  <time className="text-xs opacity-50 pl-2">{message.time}</time>
                  {message?.sender === "Assist" && message?.fallback && (
                    <div className="my-1">
                      <div className="max-w-[30rem] text-primary rounded-lg text-xs overflow-hidden transition-all duration-200 hover:bg-base-200/90">
                        <input type="checkbox" id={`retry-${message.id}`} className="peer hidden" />

                        <label
                          htmlFor={`retry-${message.id}`}
                          className="px-3 py-1.5 min-h-0 h-7 leading-none cursor-pointer flex items-center justify-between w-full gap-2 transition-all duration-200 hover:bg-base-300/20 peer-checked:bg-base-300/30 flex-row-reverse"
                        >
                          {/* Left side - text */}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-xs opacity-80">↻</span>
                            <span className="truncate">Retried with</span>
                            <span className="font-medium truncate text-primary/90">{message?.modelName}</span>
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

                  {/* Display finish_reason alert if present and not "completed" */}
                  {message?.sender === "Assist" && message?.finish_reason &&
                    message.finish_reason !== "completed" && message.finish_reason !== "no_reason" && (
                      <div className="my-1">
                        <div className="max-w-[30rem] bg-base-200/50 border border-warning/20 rounded-md px-3 py-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <AlertIcon size={12} className="text-warning flex-shrink-0" />
                              <span className="text-xs text-base-content/80 leading-tight">
                                {FINISH_REASON_DESCRIPTIONS[message.finish_reason]}
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
                {message?.images && message?.images?.length > 0 && (
                  <div className="flex flex-wrap mt-2 items-end justify-end">
                    {message?.images.map((url, imgIndex) => (
                      <Image
                        key={imgIndex}
                        src={url}
                        alt={`Message Image ${imgIndex + 1}`}
                        width={80} // Adjust width as needed
                        height={80} // Adjust height as needed
                        className="w-20 h-20 object-cover m-1 rounded-lg cursor-pointer"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                )}
                {message?.files && message?.files?.length > 0 && (
                  <div className="flex flex-wrap mt-2 items-end justify-end space-x-2 bg-base-200 p-2 rounded-md mb-1">
                    {message?.files.map((url, fileIndex) => (
                      <a key={fileIndex} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:underline">
                        <PdfIcon height={20} width={20} />
                        <span className="text-sm overflow-hidden truncate max-w-[10rem]">{truncate(url.split('/').pop(), 20)}</span>
                      </a>
                    ))}
                  </div>
                )}
                {message?.content && <div className="chat-bubble inline-block break-all">
                  <ReactMarkdown components={{
                    code: ({ node, inline, className, children, ...props }) => (
                      <CodeBlock
                        inline={inline}
                        className={className}
                        isDark={true} // Pass isDark to CodeBlock
                        {...props}
                      >
                        {children}
                      </CodeBlock>
                    )
                  }}>{message.content}</ReactMarkdown>
                </div>}
              </div>
            )
          })}
        </div>


        <div className="border-t-2 border-base-content/30 px-4 pt-4 mb-2 sm:mb-0 w-full z-low">
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
                setUploadedFiles={setUploadedFiles} />
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;