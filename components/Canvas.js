import { SendHorizontalIcon } from "@/components/Icons";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

function Canvas({ OptimizePrompt, height = "60vh", width = "100%", messages, setMessages }) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const handleResetChat = () => {
    setMessages([]);
    setInstruction("");
     if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
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
      const assistantMessage = {
        id: Date.now() + 1,
        sender: "assistant",
        content: result.description,
        optimized:result.updated,
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
    <div className=" pt-4" style={{ width }}>
      <div className="w-full flex justify-between items-center pb-0 mb-0 ">
        <span className="label-text font-semibold">Instructions</span>
        {messages.length > 0 && (
          <button className="btn btn-sm" onClick={handleResetChat}>
            Reset Chat
          </button>
        )}
      </div>

      <div className="sm:p-2 mt-4 justify-between flex flex-col border rounded-md w-full z-low" style={{ height }}>
        <div id="messages" className="flex flex-col w-full overflow-y-auto overflow-x-hidden mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              ref={index === messages.length - 1 ? messagesEndRef : null}
              className={`chat ${message.sender === "user" ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-header">
                {message.sender}
                <time className="text-xs opacity-50 pl-2">{message.time}</time>
              </div>
              <div className="chat-bubble mt-1 whitespace-pre-wrap">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat chat-start">
              <div className="chat-header">
                assistant
                <time className="text-xs opacity-50 pl-2">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <div className="chat-bubble mt-1 flex justify-center items-center">
                <div className="flex gap-2 items-center justify-center">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="flex flex-row gap-2 items-end">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                className="textarea textarea-bordered w-full focus:border-primary max-h-[100px] resize-none overflow-y-auto"
                placeholder="Type your instruction..."
                value={instruction}
                rows={1}
                onChange={(e) => {
                  setInstruction(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
            </div>
            <button 
              className="btn btn-primary mb-2" 
              disabled={loading || !instruction.trim()} 
              onClick={handleSend}
            >
              {loading && <span className="loading loading-spinner"></span>} 
              <SendHorizontalIcon />
            </button>
          </div>
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Canvas;
