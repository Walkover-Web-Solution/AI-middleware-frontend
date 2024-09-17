import { useState } from "react";
import { Bot, FilePenLine, Info, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "../codeBlock/codeBlock";
import { useDispatch } from "react-redux";
import { updateContentHistory } from "@/store/action/historyAction";
import { usePathname } from "next/navigation";


const ThreadItem = ({index, item, threadHandler, formatDateAndTime, integrationData }) => {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const path = pathName?.split('?')[0].split('/');
  const bridge_id = path[5] || '';


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [thread,setThread] = useState(item);
  
  const handleEdit = () => {
    setModalInput(item.content);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setModalInput(""); 
  };

  const handleSave = () => {
    dispatch(updateContentHistory({id:item.id,bridge_id,message:modalInput,index}))
    setIsModalOpen(false);
    setModalInput("");
  };

  return (
    <div key={`item-id-${item?.id}`} >
      {item?.role === "tools_call" ? (
      <div className="w-full flex overflow-y-scroll align-center justify-center gap-2">
        {Object.keys(item.function).map((funcName, index) => (
          <div key={index} role="alert" className="alert w-1/3 transition-colors duration-200">
            <Info size={16} />
            <div onClick={() => openViasocket(funcName, {flowHitId: JSON.parse(item.function[funcName])?.metadata?.flowHitId})} className="cursor-pointer">
              <h3 className="font-bold">Functions Executed</h3>
              <div className="text-xs">Function "{integrationData?.[funcName]?.title || funcName}" executed successfully.</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className={`chat ${item?.role === "user" ? "chat-start" : "chat-end"}`}>
        <div className="chat-image avatar flex justify-center items-center">
          <div className="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
            {item?.role === "user" ? <User /> : <Bot />}

          </div>
        </div>
        <div className="chat-header flex gap-2">
          {/* {item.role.replaceAll("_", " ")} */}

          <time className="text-xs opacity-50">{formatDateAndTime(item?.createdAt)}</time>
        </div>
        <div className={`${item?.role === "user" ? "cursor-pointer chat-bubble-primary " : "bg-base-200  text-base-content"} chat-bubble relative`} onClick={() => threadHandler(item.thread_id, item)}>
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
              {item?.role==='assistant' && item?.updated_message ? item?.updated_message:item?.content}
            </ReactMarkdown>
            {item?.role === 'assistant' && (
              <FilePenLine 
                className="absolute top-2 right-2 text-sm cursor-pointer"
                onClick={() => handleEdit()} 
              />
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div  
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
        >
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] transform transition-transform duration-300 scale-100 p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Enter your input:</span>
              </label>
              <textarea 
                type="text" 
                className="input input-bordered textarea min-h-[200px]" 
                defaultValue={modalInput}
                onBlur={(e) => setModalInput(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                className="btn " 
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={(e)=>handleSave(e)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadItem;
