import { useCustomSelector } from "@/customSelector/customSelector";
import { updateVariables } from "@/store/reducer/bridgeReducer";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useDispatch } from "react-redux";
import CodeBlock from "../codeBlock/codeBlock";
import ChatTextInput from "./chatTextInput";

function Chat({ params }) {

  const dispatch = useDispatch();
  const { variablesKeyValue } = useCustomSelector((state) => ({
    variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
  }));

  const messagesEndRef = useRef(null);

  // State variables
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAccordionVisible, setIsAccordionVisible] = useState(false); // State for visibility of key-value fields
  const [keyValuePairs, setKeyValuePairs] = useState(variablesKeyValue || []); // State for key-value pairs

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: "", value: "" }]);
    setIsAccordionVisible(true);
  };

  const handleRemoveKeyValuePair = index => {
    const updatedPairs = keyValuePairs.filter((_, i) => i !== index);
    dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }))
    setKeyValuePairs(updatedPairs);
    if (updatedPairs.length === 0) {
      setIsAccordionVisible(false);
    }
  };

  const handleKeyValueChange = (index, field, value) => {
    let updatedPairs = [...keyValuePairs];
    updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }))
    setKeyValuePairs(updatedPairs);
  };

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
              <div className="tooltip" onClick={() => setIsAccordionVisible(!isAccordionVisible)} data-tip="Add variables">
                <button
                  className="btn"
                  onClick={() => setIsAccordionVisible(!isAccordionVisible)}
                >
                  +
                </button>
              </div>
            </div>
            {isAccordionVisible && (
              <div className="join join-vertical w-full mt-4">
                <div className="collapse collapse-arrow join-item border border-base-300">
                  <input type="checkbox" className="peer" />
                  <div className="collapse-title text-xl font-medium peer-checked:bg-base-300 peer-checked:text-base-content">
                    Add Variables
                  </div>
                  <div className="collapse-content">
                    <div className="flex flex-col gap-4 max-h-56 overflow-y-auto">
                      {keyValuePairs.map((pair, index) => (
                        <div key={index} className="flex flex-row gap-4 items-end">
                          <div className="form-control w-full sm:w-1/2">
                            {index === 0 && <label className="label">
                              <span className="label-text">Key</span>
                            </label>}
                            <input
                              type="text"
                              className="input input-bordered input-sm w-full"
                              placeholder="Enter key"
                              key={pair.key}
                              defaultValue={pair.key}
                              // value={pair.key}
                              onBlur={e => handleKeyValueChange(index, "key", e.target.value)}
                            />
                          </div>
                          <div className="form-control w-full sm:w-1/2">
                            {index === 0 && <label className="label">
                              <span className="label-text">Value</span>
                            </label>}
                            <input
                              type="text"
                              className="input input-bordered input-sm w-full"
                              placeholder="Enter value"
                              // value={pair.value}
                              key={pair.value}
                              defaultValue={pair.value}
                              onBlur={e => handleKeyValueChange(index, "value", e.target.value)}
                            />
                          </div>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleRemoveKeyValuePair(index)}
                          >
                            -
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn self-center mt-4"
                        onClick={handleAddKeyValuePair}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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