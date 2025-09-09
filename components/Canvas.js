import { SendHorizontalIcon } from "@/components/Icons";
import { BrainCircuit, CheckIcon, CopyIcon, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import CodeBlock from "./codeBlock/codeBlock";

function Canvas({ 
  OptimizePrompt,  
  width = "100%", 
  height = "100%", 
  messages, 
  setMessages, 
  handleApplyOptimizedPrompt = () => {} ,
  label = "prompt"
}) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedMessages, setAppliedMessages] = useState(new Set());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleResetChat = () => {
    setMessages([]);
    setInstruction("");
    setAppliedMessages(new Set());
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleApply = (message) => {
    handleApplyOptimizedPrompt(message.optimized);
    setAppliedMessages(prev => new Set(prev).add(message.id));
  };

  // Helper function to check if content is JSON and format it
  const formatMessageContent = (content) => {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      // If successful, return formatted JSON with proper indentation
      return {
        isJson: true,
        formatted: JSON.stringify(parsed, null, 2)
      };
    } catch (e) {
      // If not JSON, return original content
      return {
        isJson: false,
        formatted: content
      };
    }
  };

  const handleSend = async () => {
    if (!instruction.trim()) {
      setErrorMessage("Please enter an instruction.");
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: instruction.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInstruction("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await OptimizePrompt(instruction);
      const result = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Ensure content is always a string
      let contentString = "";
      if (result && result.updated !== undefined) {
        contentString = typeof result.updated === 'string' 
          ? result.updated 
          : JSON.stringify(result.updated, null, 2); // Format JSON with indentation
      } else {
        contentString = "No content returned from optimization.";
      }
      
      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        content: contentString,
        optimized: result.updated, // Keep the original format for functionality
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        content: "Please enter a prompt first",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ width, height }} className="flex flex-col bg-base-100">
      {/* Header with Reset Button */}
      <div className="flex justify-between items-center pb-1 mb-1">
      <h4 className="text-sm font-semibold text-base-content flex items-center gap-1 justify-center"><BrainCircuit size={14}/> <span>{label} Optimizer</span></h4>
      <div className="flex justify-between items-center">
        {messages.length > 0 && (
          <button 
            className="btn btn-xs  btn-outline btn-error hover:btn-error"
            onClick={handleResetChat}
          >
            <RotateCcw size={14}/>
            Reset Chat
          </button>
        )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-base-100 border border-base-300 rounded-lg shadow-sm overflow-hidden">
        {/* Messages Area */}
        <div 
          id="messages" 
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 space-y-4"
        >
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
               <Lightbulb />
              </div>
              <p className="text-base-content/70">Start a conversation to optimize your {label}</p>
            </div>
          )}

          {messages.map((message, index) => {
            const { isJson, formatted } = formatMessageContent(message.content);
            
            return (
              <div
                key={message.id || index}
                ref={index === messages.length - 1 ? messagesEndRef : null}
                className={`chat group ${message.sender === "user" ? "chat-end" : "chat-start"}`}
              >
                {/* Chat Header with Apply Button */}
                <div className="chat-header flex justify-between w-full items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{message.sender}</span>
                    <time className="text-xs opacity-50">{message.time}</time>
                  </div>
                  
                  {message.sender === "assistant" && message.optimized && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {appliedMessages.has(message.id) ? (
                        <div className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                          <CheckIcon size={14}/>
                          Applied
                        </div>
                      ) : (
                        <button 
                          className="btn btn-xs btn-primary gap-1 hover:btn-primary-focus transition-all duration-200 shadow-sm" 
                          onClick={() => handleApply(message)}
                        >
                          <CopyIcon size={14}/>
                          <span className="hidden sm:inline">Apply</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Chat Bubble */}
                <div className="chat-bubble text-sm leading-relaxed max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl break-words">
                  {isJson ? (
                    <pre className="whitespace-pre-wrap text-base-content font-mono text-xs bg-base-200 p-3 rounded-lg overflow-x-auto">
                      <CodeBlock>{formatted}</CodeBlock>
                    </pre>
                  ) : (
                    <Markdown 
                      className="prose prose-sm max-w-none"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        code: ({ children }) => <code className="bg-base-200 px-1 py-0.5 rounded text-xs">{children}</code>
                      }}
                    >
                  {message.content}
                    </Markdown>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Loading State */}
          {loading && (
            <div className="chat chat-start">
              <div className="chat-header mb-1">
                <span className="text-sm font-medium">assistant</span>
                <time className="text-xs opacity-50 pl-2">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <div className="chat-bubble flex justify-center items-center min-h-[3rem]">
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-r from-base-100 to-base-200 border-t border-base-300 px-2 py-2 ">
          <div className="flex gap-3 items-center max-w-4xl mx-auto justify-center">
            <div className="flex-1 relative mt-1">
              <textarea
                ref={textareaRef}
                className="w-full px-4 py-3 text-sm bg-base-100 border border-base-content/40 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] max-h-32 placeholder-gray-400"
                placeholder={`Describe how you'd like to improve your ${label}...`}
                value={instruction}
                rows={1}
                onChange={(e) => {
                  setInstruction(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    if (e.shiftKey) {
                      return;
                    } else {
                      e.preventDefault();
                      handleSend();
                    }
                  }
                }}
              />
              {/* Character counter or typing indicator could go here */}
            </div>
            
            <button 
              className="h-11 w-11 bg-gradient-to-r from-base-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-base-content bg-base-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-sm group" 
              disabled={loading || !instruction.trim()} 
              onClick={handleSend}
            >
              {loading ? (
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-base-200"></div>
              ) : (
                <SendHorizontalIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-4xl mx-auto mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}
        
        </div>
      </div>
    </div>
  );
}

export default Canvas;