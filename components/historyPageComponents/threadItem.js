// components/ThreadItem.js
import { updateContentHistory } from "@/store/action/historyAction";
import { Bot, Info, Pencil, User } from "lucide-react";
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch } from "react-redux";
import CodeBlock from "../codeBlock/codeBlock";

const ThreadItem = ({ index, item, threadHandler, formatDateAndTime, integrationData, params }) => {
  const dispatch = useDispatch();
  const [modalInput, setModalInput] = useState("");
  const modalRef = useRef(null);

  const handleEdit = () => {
    setModalInput(item.updated_message || item.content);
    if (modalRef.current) {
      modalRef.current.showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  const handleClose = () => {
    setModalInput("");
    if (modalRef.current) {
      modalRef.current.close();
    } else {
      console.error("Modal element not found");
    }
  };

  const handleSave = () => {
    if (modalInput.trim() === "") {
      alert("Message cannot be empty.");
      return;
    }
    dispatch(updateContentHistory({
      id: item.id,
      bridge_id: params.id,
      message: modalInput,
      index
    }));
    setModalInput("");

    if (modalRef.current) {
      modalRef.current.close();
    } else {
      console.error("Modal element not found");
    }
  };

  return (
    <div key={`item-id-${item?.id}`} >
      {item?.role === "tools_call" ? (
        <div className="w-full flex overflow-y-scroll align-center justify-center gap-2">
          {Object.keys(item.function).map((funcName, index) => (
            <div key={index} role="alert" className="alert w-1/3 transition-colors duration-200">
              <Info size={16} />
              <div onClick={() => openViasocket(funcName, { flowHitId: JSON.parse(item.function[funcName])?.metadata?.flowHitId })} className="cursor-pointer">
                <h3 className="font-bold">Functions Executed</h3>
                <div className="text-xs">Function "{integrationData?.[funcName]?.title || funcName}" executed successfully.</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className={`chat ${item.role === "user" ? "chat-start" : "chat-end"}`}>
            <div className="chat-image avatar flex justify-center items-center">
              <div className="w-100 p-2 rounded-full bg-base-300 flex justify-center items-center">
                {item.role === "user" ? <User size={20}/> : <Bot size={20}/>}
              </div>
            </div>
            <div className="chat-header flex gap-2">
              {item.updated_message ? <p className="text-xs opacity-50">Edited</p> : ""}
              <time className="text-xs opacity-50">{formatDateAndTime(item.createdAt)}</time>
            </div>
            <div className={`${item.role === "user" ? "cursor-pointer chat-bubble-primary " : "bg-base-200  text-base-content pr-10"} chat-bubble`} onClick={() => threadHandler(item.thread_id, item)}>
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
              }}>{item?.updated_message || item?.content}</ReactMarkdown>
              {item?.role === 'assistant' && (
                <div className="tooltip absolute top-2  right-2 text-sm cursor-pointer" data-tip="Edit response">
                  <Pencil
                    size={16}
                    onClick={handleEdit}
                  />
                </div>
              )}
            </div>
          </div>
          {
            item?.error && (
              <div className="chat chat-end">
                <div className="flex-1 chat-bubble bg-base-200 text-error">
                  <span className="font-bold">Error</span>
                  <p>{item.error}</p>
                </div>
                <div className="w-100 p-3 rounded-full bg-base-300 flex justify-center items-center">
                  <Bot />
                </div>
              </div>
            )
          }
        </div>
      )}
      {/* Modal */}
      <dialog className="modal modal-bottom sm:modal-middle" ref={modalRef}>
        <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-[50%] p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Enter your input:</span>
            </label>
            <textarea
              type="text"
              className="input input-bordered textarea min-h-[200px]"
              defaultValue={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ThreadItem;