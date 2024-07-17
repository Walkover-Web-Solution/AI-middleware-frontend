import { dryRun } from "@/config";
import { useCustomSelector } from "@/customSelector/customSelector";
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { updateVariables } from "@/store/reducer/bridgeReducer";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function Chat({ params }) {
  const { bridge, variablesKeyValue } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || []
  }));
  const messagesEndRef = useRef(null);
  const dataToSend = {
    configuration: {
      model: bridge?.configuration?.model?.default,
      type: bridge?.type
    },
    service: bridge?.service?.toLowerCase(),
    apikey: bridge?.apikey,
    bridgeType: bridge?.bridgeType,
    slugName: bridge?.slugName
  };
  const dispatch = useDispatch();

  // State variables
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [localDataToSend, setLocalDataToSend] = useState(dataToSend);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isAccordionVisible, setIsAccordionVisible] = useState(false); // State for visibility of key-value fields
  const [keyValuePairs, setKeyValuePairs] = useState(variablesKeyValue || []); // State for key-value pairs

  const defaultsMap = useMemo(() => {
    return bridge ? Object.entries(bridge?.configuration).reduce((acc, [key, value]) => {
      const isToolsEmptyArray = key === 'tools' && Array.isArray(value.default) && value.default.length === 0;
      if (!isToolsEmptyArray && value.default !== undefined) {
        acc[key] = value.default;
      }
      if (!acc.hasOwnProperty('tools') || acc?.tools?.length === 0) {
        delete acc['tool_choice'];
      }
      return acc;
    }, {}) : {};
  }, [bridge]);

  // Update localDataToSend configuration
  const updateLocalDataToSend = useCallback(updateFn => {
    setLocalDataToSend(prevDataToSend => ({
      ...prevDataToSend,
      bridge_id: params?.id,
      configuration: {
        ...prevDataToSend.configuration,
        ...updateFn(prevDataToSend.configuration),
      },
    }));
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (dataToSend.configuration.type === "chat") if (newMessage.trim() === "") return;
    setErrorMessage("");
    setNewMessage("");
    setLoading(true);
    try {
      // Create the variables object
      const variables = variablesKeyValue.reduce((acc, pair) => {
        if (pair.key && pair.value) {
          acc[pair.key] = pair.value;
        }
        return acc;
      }, {});

      // Create user chat
      const newChat = {
        id: messages.length + 1,
        sender: "user",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: newMessage,
      };
      let response, responseData;
      let data;
      if (dataToSend.configuration.type === "chat") {
        data = modelInfo[localDataToSend.service].chatmessage.chat;
        const chatPath = modelInfo[localDataToSend.service].chatmessage.chatpath;
        _.set(data, chatPath, newMessage);
        setMessages(prevMessages => [...prevMessages, newChat]);
        responseData = await dryRun({
          localDataToSend: {
            ...localDataToSend,
            configuration: {
              ...localDataToSend.configuration,
              prompt: bridge?.inputConfig?.system?.default,
              conversation: conversation,
              ...defaultsMap,
              user: data.content,
            },
            variables // Include variables in the request data
          },
          bridge_id: params?.id
        });
      }
      else if (dataToSend.configuration.type === "completion") {
        responseData = await dryRun({
          localDataToSend: {
            ...localDataToSend,
            configuration: {
              ...localDataToSend.configuration
            },
            prompt: bridge?.inputConfig?.prompt?.prompt
          },
          bridge_id: params?.id
        });
      }
      else if (dataToSend.configuration.type === "embedding") {
        responseData = await dryRun({
          localDataToSend: {
            ...localDataToSend,
            configuration: {
              ...localDataToSend.configuration
            },
            input: bridge?.inputConfig?.input?.input
          },
          bridge_id: params?.id
        });
      }
      if (!responseData.success) {
        if (dataToSend.configuration.type === "chat") {
          setConversation(prevConversation => [...prevConversation, _.cloneDeep(data)].slice(-6));
        }
        toast.error(responseData.error);
        setLoading(false);
        return;
      }
      response = responseData.data;
      const { outputConfig } = modelInfo[localDataToSend.service][localDataToSend.configuration.model];
      const outputPath = outputConfig.message;
      const assistPath = outputConfig.assistant;
      const content = _.get(response.response, outputPath, "");
      const assistConversation = _.get(response.response, assistPath, "");

      // Update localDataToSend with assistant conversation
      if (dataToSend.configuration.type === "chat") {
        setConversation(prevConversation => [...prevConversation, _.cloneDeep(data), assistConversation].slice(-6));
      }
      const newChatAssist = {
        id: messages.length + 2,
        sender: "Assist",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: Array.isArray(content) ? content.join(", ") : content.toString(),
      };

      // Add assistant chat to messages
      setMessages(prevMessages => [...prevMessages, newChatAssist]);

      // Clear new message input
      setNewMessage("");
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [newMessage, messages, localDataToSend, updateLocalDataToSend, keyValuePairs, defaultsMap, conversation, dataToSend.configuration.type]);

  // Handle key press event
  const handleKeyPress = useCallback(
    event => {
      if (event.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    setLocalDataToSend(dataToSend);
  }, [bridge]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: "", value: "" }]);
    setIsAccordionVisible(true);
  };

  const handleRemoveKeyValuePair = index => {
    const updatedPairs = keyValuePairs.filter((_, i) => i !== index);
    dispatch(updateVariables({data: updatedPairs, bridgeId: params.id}))
    setKeyValuePairs(updatedPairs);
    if (updatedPairs.length === 0) {
      setIsAccordionVisible(false);
    }
  };

  const handleKeyValueChange = (index, field, value) => {
    let updatedPairs = [...keyValuePairs];
    updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    dispatch(updateVariables({data: updatedPairs, bridgeId: params.id}))
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
          {messages.map((message, index) => (
            < div
              key={message.id}
              ref={index === messages.length - 1 ? messagesEndRef : null}
              className={`chat ${message.sender === "user" ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar"></div>
              <div className="chat-header">
                {message.sender}
                <time className="text-xs opacity-50 pl-2">{message.time}</time>
              </div>
              <div className="chat-bubble break-keep"> <ReactMarkdown>{message.content}</ReactMarkdown></div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="relative flex flex-col gap-4 w-full">
            <div className="input-group flex gap-2 w-full">
              {localDataToSend && (dataToSend?.configuration?.type !== "completion") && (dataToSend?.configuration?.type !== "embedding") && (
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered w-full"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              )}
              <button
                className="btn"
                onClick={handleSendMessage}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-dots loading-lg"></span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6 ml-2 transform rotate-90"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
              <button
                className="btn"
                onClick={() => setIsAccordionVisible(!isAccordionVisible)}
              >
                +
              </button>
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
                        <div key={index} className="flex flex-row gap-4 items-center">
                          <div className="form-control w-full sm:w-1/2">
                            <label className="label">
                              <span className="label-text">Key</span>
                            </label>
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
                            <label className="label">
                              <span className="label-text">Value</span>
                            </label>
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
                            className="btn btn-sm mt-7"
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
                        Add Variable
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
      </div >
    </>
  );
}

export default Chat;

