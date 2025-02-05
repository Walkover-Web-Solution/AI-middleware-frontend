import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import CodeBlock from "../codeBlock/codeBlock";
import ChatTextInput from "./chatTextInput";

function Chat({ params }) {
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className="label-text">Playground</span>
      </div>

      <div className="sm:p-2 mt-4 justify-between flex flex-col h-[86vh] border rounded-md w-full z-10">
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
                </div>
                <div>
                  {message?.image_urls && message?.image_urls?.length > 0 && (
                    <div className="flex flex-wrap mt-2 items-end justify-end">
                      {message?.image_urls.map((url, imgIndex) => (
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
                  }}>{message.content}</ReactMarkdown>
                </div>
              </div>
            )
          })}
        </div>


        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="relative flex flex-col gap-4 w-full">
            <div className="flex flex-row gap-2">
              <ChatTextInput setErrorMessage={setErrorMessage} setMessages={setMessages} message={messages} params={params} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} />
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