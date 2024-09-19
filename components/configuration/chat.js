import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import CodeBlock from "../codeBlock/codeBlock";
import ChatTextInput from "./chatTextInput";

function Chat({ params }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className="label-text">Playground</span>
      </div>

      <div className="p-2 sm:p-6 mt-4 justify-between flex flex-col h-[86vh] border rounded-md w-full z-10">
        <div
          id="messages"
          className="flex flex-col w-full space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch z-10"
        >
          {messages.map((message, index) => {
            return (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? messagesEndRef : null}
                className={`chat ${message.sender === "user" ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar"></div>
                <div className="chat-header">
                  {message.sender}
                  <time className="text-xs opacity-50 pl-2">{message.time}</time>
                </div>
                <div className="chat-bubble break-keep">
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
                  }}>{message.content}</ReactMarkdown></div>
              </div>
            )
          })}
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="relative flex flex-col gap-4 w-full">
            <div className="flex flex-row gap-2">
              <ChatTextInput setErrorMessage={setErrorMessage} setMessages={setMessages} params={params} />
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
      </div>
    </>
  );
}

export default Chat;