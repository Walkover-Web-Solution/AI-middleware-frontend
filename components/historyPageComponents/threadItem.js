import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ThreadItem = ({ item, threadHandler, formatDateAndTime, integrationData }) => (
  <div key={`item.id${item.id}`} >
    {item.role === "tools_call" ? (
      <div className="w-full flex overflow-y-scroll align-center justify-center">
        {Object.keys(item.function).map((funcName, index) => (
          <div key={index} role="alert" className="alert shadow-lg w-1/3 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">Functions Executed</h3>
              <div className="text-xs">Function "{integrationData[funcName].title || funcName}" executed successfully.</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className={`chat ${item.role === "user" ? "chat-start" : "chat-end"}`}>
        <div class="chat-image avatar flex justify-center items-center">
          <div class="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
            {item.role === "user" ? <User /> :<Bot />}
            
          </div>
        </div>
        <div className="chat-header flex gap-2">
          {/* {item.role.replaceAll("_", " ")} */}

          <time className="text-xs opacity-50">{formatDateAndTime(item.createdAt)}</time>
        </div>
        <div className={`${item.role === "user" ? "cursor-pointer chat-bubble-primary " : "bg-base-200  text-base-content"} chat-bubble`} onClick={() => threadHandler(item.thread_id, item)}>
          <ReactMarkdown>{item.content}</ReactMarkdown>
        </div>
      </div>
    )}
  </div>
);

export default ThreadItem;
