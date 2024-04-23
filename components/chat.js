import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { dryRun, updateBridge } from "@/api";
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import _ from "lodash";
import { toast } from "react-toastify";
import { updateBridgeAction } from "@/store/action/bridgeAction";

function Chat({ dataToSend, params }) {
  const dispatch = useDispatch();

  // State variables
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [localDataToSend, setLocalDataToSend] = useState(dataToSend);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversation, setConversation] = useState([]);

  // Update localDataToSend when dataToSend changes
  useEffect(() => {
    setLocalDataToSend(dataToSend);
  }, [dataToSend]);

  // Update localDataToSend configuration
  const updateLocalDataToSend = useCallback(updateFn => {
    setLocalDataToSend(prevDataToSend => ({
      ...prevDataToSend,
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
        // updateLocalDataToSend(prevConfig => ({
        //   user: [...prevConfig.user, data],  
        // }));
        setMessages(prevMessages => [...prevMessages, newChat]);
        responseData = await dryRun({
          ...localDataToSend,
          configuration: {
            ...localDataToSend.configuration,
            conversation: conversation,
            user: data,
          },
        });
      }
      else {
        const updatedConfigration = removeUndefinedOrNull(localDataToSend.configuration)
        responseData = await dryRun({ ...localDataToSend, configuration: updatedConfigration });
      }
      if (!responseData.success) {
        if (dataToSend.configuration.type === "chat") {
          setConversation(prevConversation => [...prevConversation, _.cloneDeep(data)].slice(-6));
        }
        // setErrorMessage(responseData.error);
        toast.error(responseData.error);
        setLoading(false);
        return;
      }
      response = responseData.data;
      // Update localDataToSend with user data

      // Add user chat to messages

      // Call API with user data

      // Get output configuration paths
      const { outputConfig } = modelInfo[localDataToSend.service][localDataToSend.configuration.model];
      const outputPath = outputConfig.message;
      const assistPath = outputConfig.assistant;
      const content = _.get(response.response, outputPath, "");
      const assistConversation = _.get(response.response, assistPath, "");

      // Update localDataToSend with assistant conversation
      if (dataToSend.configuration.type === "chat") {
        setConversation(prevConversation => [...prevConversation, _.cloneDeep(data), assistConversation].slice(-6));
      }

      // Create assistant chat
      const newChatAssist = {
        id: messages.length + 2,
        sender: "Assist",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: content,
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
  }, [newMessage, messages, localDataToSend, updateLocalDataToSend]);

  // Handle key press event
  const handleKeyPress = useCallback(
    event => {
      if (event.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );


  // const removeUndefinedOrNull = (obj) => {
  //   // Filter out key-value pairs where value is not undefined or null
  //   const filteredEntries = Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null);

  //   // Convert filtered entries back to object
  //   return Object.fromEntries(filteredEntries);
  // };


  const UpdateBridge = async () => {
    // const updatedConfigration = removeUndefinedOrNull(localDataToSend.configuration)
    dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: localDataToSend.configuration, service: localDataToSend.service, apikey: localDataToSend.apikey } }))
  }

  return (
    <>
      <div className="w-full flex justify-between items-center">
        {/* <div className="label"> */}
        <span className="label-text">Playground</span>
        <button className="btn btn-sm m-5" onClick={UpdateBridge}>Update Bridge</button>
        {/* </div> */}
      </div>

      <div className=" p:2 sm:p-6 justify-between flex flex-col h-[80vh] lg:w-[50vw] border rounded-xl w-full z-10">
        <div
          id="messages"
          className="flex flex-col w-full space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch z-10"
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`chat ${message.sender === "user" ? "chat-end" : "chat-start"
                }`}
            >
              <div className="chat-image avatar"></div>
              <div className="chat-header">
                {message.sender}
                <time className="text-xs opacity-50 pl-2">{message.time}</time>
              </div>
              <div className="chat-bubble">{message.content}</div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0 w-full z-10">
          <div className="relative flex justify-start items-center w-full ">
            <div className="form-control w-full">
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
              </div>
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
